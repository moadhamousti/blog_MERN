
import { Link } from "react-router-dom";
import { useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import logo from "./images/logo.png";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);

  useEffect(() => {
    fetch("http://localhost:4000/profile", {
      credentials: "include",
    }).then((response) => {
      response.json().then((userInfo) => {
        setUserInfo(userInfo);
      });
    });
  }, []);

  // log out function 

  function logout() {
    fetch("http://localhost:4000/logout", {
      credentials: "include",
      method: "POST",
    });
    setUserInfo(null);
  }

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">
        <img src={logo} alt="Logo" />
      </Link>
      <nav>
        {username && (
          <>
          {/* if logged in  */}
            <Link to="/create">
              <i className="fas fa-pen"></i> Add post
            </Link>
            <a onClick={logout} to="/login">
              <i className="fas fa-sign-out-alt"></i> Logout
            </a>
          </>
        )}
        {!username && (
          <>
          {/* if logged out  */}
            <Link to="/login">
              <i className="fas fa-sign-in-alt"></i> Login
            </Link>
            <Link to="/register">
              <i className="fas fa-user-plus"></i> Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
