import { React, createContext, useCallback, useState, useEffect } from "react";

let logoutTimer;

export const AuthContext = createContext({
  isLoggedIn: false,
  token: null,
  userId: null,
  login: () => {},
  logout: () => {},
});

const AuthContextProvider = (props) => {
  const [authToken, setAuthToken] = useState();
  const [userId, setUserId] = useState();
  const [tokenExpireDate, setTokenExpireDate] = useState();

  // // Reducer Function
  // const  = (state, action) => {

  // };

  const login = useCallback((uid, token, expireData) => {
    setAuthToken(token);
    setUserId(uid);
    const tokenExpireDate =
      expireData || new Date(new Date().getTime() + 1000 * 60 * 60);
    setTokenExpireDate(tokenExpireDate);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: uid,
        token: token,
        expire: tokenExpireDate.toISOString(),
      })
    );
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setTokenExpireDate(null);
    setUserId(null);
    localStorage.removeItem("userData");
  }, []);

  useEffect(() => {
    if (authToken && tokenExpireDate) {
      const remainingTime = tokenExpireDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [authToken, logout, tokenExpireDate]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.token &&
      storedData.userId &&
      new Date(storedData.expire) > new Date()
    ) {
      login(storedData.userId, storedData.token);
    }
  }, [login]);

  // Initial Provider State
  const contextValue = {
    isLoggedIn: !!authToken,
    token: authToken,
    userId: userId,
    login: login,
    logout: logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
