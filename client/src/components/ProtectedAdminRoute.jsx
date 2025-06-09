import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedAdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // Si l'utilisateur n'est pas connecté ou n'est pas admin, on redirige vers la page de connexion admin.
  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/signin" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
