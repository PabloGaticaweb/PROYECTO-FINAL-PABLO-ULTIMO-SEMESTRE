// src/assets/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roles = [] }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    // No autenticado
    return <Navigate to="/login" replace />;
  }

  // Si roles fue provisto y el rol del usuario no está en la lista, negar acceso
  if (roles.length > 0 && !roles.includes(user.rol)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
