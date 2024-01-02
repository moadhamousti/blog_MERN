// Imports the Express.js framework for building web applications in Node.js:
const express = require('express');

// Incorporates the CORS (Cross-Origin Resource Sharing) middleware to handle cross-origin HTTP requests
const cors = require('cors');

// models 
const User = require('./models/User');

// Sets up the Express.js application:
const app = express();

// Imports Mongoose, an ODM (Object Data Modeling) library for MongoDB and Node.js 
const mongoose = require('mongoose');

// Imports bcryptjs for password hashing and checking.
const bcrypt = require('bcryptjs');

// Utilizes the jsonwebtoken library for generating and verifying JSON Web Tokens (JWT).
const jwt = require('jsonwebtoken');

// Incorporates cookie-parser middleware for parsing cookies in the HTTP request. 
const cookieParser = require('cookie-parser');

// Requires the multer middleware for handling file uploads. 
const multer = require('multer');

// Configures multer to store uploaded files in the 'uploads/' directory. 
const uploadMiddleware = multer({ dest: 'uploads/' });

// Imports the Node.js file system module for interacting with the file system. 
const fs = require('fs');

// Post Model 
const Post = require('./models/Post');



// accept requests from the application running on 'http://localhost:3000'.

// to active cookie 
app.use(cors({credentials:true,origin:'http://localhost:3000'}));

// Configures Express to parse incoming requests with JSON payloads 
app.use(express.json());

// Incorporates the cookie-parser middleware, allowing the server to parse and handle cookies sent in the HTTP request headers. 
app.use(cookieParser());

// fetch images and displaying them in each post 
app.use('/uploads', express.static(__dirname + '/uploads'));

// The salt used in password hashing to enhance security.
const salt = bcrypt.genSaltSync(10);


const secret = 'asdfe45we45w345wegw345werjktjwertkj';

mongoose.connect('mongodb+srv://blog:YlwNRp5WqDYX6t6d@cluster0.9jhji2b.mongodb.net/?retryWrites=true&w=majority');


// app.get('/test', async (req,res) => {
//   res.json('testok');
    
// });

app.post('/register', async (req, res) => {
  // request Data Parser 
    const { username, password } = req.body;

    try {
        const userDoc = await User.create({ 
            username, 
            // bcrypt 
            password:bcrypt.hashSync(password,salt),
        });
        res.json(userDoc);
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.username === 1) {
            // Duplicate key error (username already exists)
            return res.status(400).json({ error: 'Username already exists' });
        }

        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    // const userDoc = await User.create({username,password})
    // res.json(userDoc);
    // res.json({requestData:{username, password}});
    // res.json(username, password);
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.findOne({ username });

        if (!userDoc) {
            // User not found
            return res.status(400).json('User not found');
        }

        // Comparing psswords after decryption 
        const passOk = bcrypt.compareSync(password, userDoc.password);


        // JWT WEB TOKEN A WAY TO STORE USER INFO COOKIES IN WEB BROWSER

        if (passOk) {
            // json web token (encrypted password and username)
            jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
                if (err) throw err;
                // send it as a cookie not a json 
                res.cookie('token', token).json({
                    id:userDoc._id,
                    username,
                });
            });
        } else {
            // Incorrect password
            res.status(400).json('Wrong Credentials');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

    // const userDoc = await findOne({username, password});
    // res.json(userDoc);
    // const passOk = bcrypt.compareSync(password, userDoc.password);
    // res.json(passOk);
});


// app.get('/test', async (req, res) => {
//   res.json("ok");
// });


// return profile information 
app.get('/profile', (req,res) =>{
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, (err,info) => {
        if (err) throw err;
        res.json(info);
      });
});



app.post('/logout', (req,res) => {
    res.cookie('token', '').json('ok');
});


app.post('/post', uploadMiddleware.single('file'), async (req,res) => {

    // storing files as ajpg or webp 
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
      if (err) throw err;
      const {title,summary,content} = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover:newPath,
        author:info.id,
      });
      res.json(postDoc);
    });
  
  });


  // displaying posts
  
  app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  let newPath = null;

  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path + '.' + ext;
    fs.renameSync(path, newPath);
  }

  const { token } = req.cookies;

  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    try {
      const { id, title, summary, content } = req.body;
      const postDoc = await Post.findById(id);

      // Check if postDoc is null or undefined
      if (!postDoc) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);

      if (!isAuthor) {
        return res.status(400).json({ error: 'You are not the author' });
      }

      // Use updateOne to update the document
      await Post.updateOne(
        { _id: id },
        {
          $set: {
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover,
          },
        }
      );

      res.status(200).json({ message: 'Post updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

  

  // displaying posts in the main page 

app.get('/post', async (req,res) => {
    res.json(await Post.find()
        .populate('author', ['username'])
        // display the recent post
        .sort({createdAt: -1})
        // limit posts in timeline 
        .limit(20)
    );
});






// single Post Page 
app.get('/post/:id', async(req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
})

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});








