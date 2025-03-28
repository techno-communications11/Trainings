import React, { createContext, useContext, useState, useEffect } from "react";

const MyContext = createContext();

export function MyProvider({ children }) {  // Changed from MyContextProvider to match import
  const [users, setUsers] = useState([]);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    role: null,
    userId: null,
    loading: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      let retries = 3;
      while (retries > 0) {
        try {
          const response = await fetch(`${process.env.REACT_APP_BASE_URL}/users/me`, {
            method: "GET",
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setAuthState({
              isAuthenticated: true,
              role: data.role,
              userId: data.id,
              loading: false,
            });
            return;
          }
          retries--;
        } catch (error) {
          console.error("Error checking auth:", error);
          retries--;
        }
      }
      setAuthState({ isAuthenticated: false, role: null, userId: null, loading: false });
    };
    checkAuth();
  }, [authState.isAuthenticated]);

  const addUser = (newUsers) => {
    setUsers(newUsers);
  };

  const updateAuth = (isAuthenticated, role, userId) => {
    setAuthState({ isAuthenticated, role, userId, loading: false });
  };

  const logout = async () => {
    try {
      // console.log("Sending logout request to:", `${process.env.REACT_APP_BASE_URL}/logout`);
  
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
       console.log("Logout response:", response);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Logout failed');
      }
  
      window.location.href = '/';
      // console.log("Logout successful");
  
    } catch (error) {
      console.error("Logout failed:", error);
      // console.warn("Proceeding with local logout...");
    } 
    // finally {
    //   // Clear all auth-related data
    //   localStorage.removeItem("token");
    //   sessionStorage.removeItem("authState");
    //   // document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  
    //   // Update auth state
    //   setAuthState({
    //     isAuthenticated: false,
    //     role: null,
    //     userId: null,
    //     loading: false
    //   });
  
    //   // Force a hard refresh to ensure all state is cleared
    //   window.location.href = '/'; // Redirect to login page
    // }
  };

  return (
    <MyContext.Provider value={{ users, addUser, authState, updateAuth, logout }}>
      {children}
    </MyContext.Provider>
  );
}

export function useMyContext() {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error('useMyContext must be used within a MyProvider');
  }
  return context;
}