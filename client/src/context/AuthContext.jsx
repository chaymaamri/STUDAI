import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsLoggedIn(true);
    }

    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

 const login = async (email, password) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/signin", {
        email,
        mdp: password, // car dans ton backend c’est probablement `mdp` et pas `password`
      });
  
      if (response.data.user) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
  
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
        setUser(response.data.user);
        setIsLoggedIn(true);
  
        return response.data.user; // retourne les infos utilisateur
      }
    } catch (error) {
      throw error;
    }
  };
  

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // 🔥 Supprimer l'utilisateur
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;