// User Context 

// to change the header if logged in 


import {createContext, useState} from "react";

export const UserContext = createContext({});

export function UserContextProvider({children}) {
  const [userInfo,setUserInfo] = useState({});
  return (
    <UserContext.Provider value={{userInfo,setUserInfo}}>
      {children}
    </UserContext.Provider>
  );
}
