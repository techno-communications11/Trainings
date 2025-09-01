// MyContext.js
import { createContext, useContext, useState } from "react";

const MyContext = createContext();

export const MyProvider = ({ children, navigate }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: !!localStorage.getItem("userdata"),
    role: localStorage.getItem("userRole") || null,
    id: localStorage.getItem("userId") || null,
    loading: false,
  });

  // Call this after successful login
  const updateAuth = (isAuthenticated, role, id) => {
    setAuthState({
      isAuthenticated,
      role,
      id,
      loading: false,
    });
  };

  // Logout handler
  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      role: null,
      id: null,
      loading: false,
    });
    localStorage.removeItem("userdata");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    // Optionally also clear session cookies or call backend logout endpoint
  };

  return (
    <MyContext.Provider value={{ authState, updateAuth, logout, navigate }}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);