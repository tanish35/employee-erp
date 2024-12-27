import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

const ProtectedRoute = ({ children }) => {
  const { loadingUser, userDetails } = useUser();

  if (loadingUser) {
    return <div>Loading...</div>;
  }

  return userDetails ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
