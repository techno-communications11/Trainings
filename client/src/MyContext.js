import React, { createContext, useContext, useState, useEffect } from "react";

const MyContext = createContext();


export function MyProvider({ children, navigate }) {
  const [users, setUsers] = useState([]);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    role: null,
    userId: null,
    loading: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
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
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };
    checkAuth();
  }, []);

  const updateAuth = (isAuthenticated, role, userId) => {
    setAuthState({ isAuthenticated, role, userId, loading: false });
  };

  const logout = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setAuthState({
          isAuthenticated: false,
          role: null,
          userId: null,
          loading: false
        });
        navigate('/', { replace: true });
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setAuthState({
        isAuthenticated: false,
        role: null,
        userId: null,
        loading: false
      });
      navigate('/', { replace: true });
    }
  };

  return (
    <MyContext.Provider value={{ users, setUsers, authState, updateAuth, logout }}>
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