import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element }) => {
  // Check if token exists (you can add more validation here)
  const token = localStorage.getItem("token");

  if (!token) {
    // If no token, redirect to login page
    return <Navigate to="/login" />;
  }

  // If token exists, render the protected element
  return element;
};

export default ProtectedRoute;
