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
 const logout = async () => {
  try {
    await fetch(`${process.env.REACT_APP_BASE_URL}/logout`, { method: "POST", credentials: "include" });
  } catch (err) {
    console.error("Backend logout failed:", err);
  } finally {
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
    navigate("/"); // redirect to login page
  }
};


  return (
    <MyContext.Provider value={{ authState, updateAuth, logout, navigate }}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);