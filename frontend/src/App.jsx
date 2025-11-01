import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./assets/pages/Login.jsx";
import Home from "./assets/pages/Home.jsx";
import GestionUnidades from "./assets/pages/GestionUnidades.jsx";
import RegistroReparaciones from "./assets/pages/RegistroReparaciones.jsx";
import Costos from "./assets/pages/Costos.jsx";
import ProtectedRoute from "./assets/ProtectedRoute.jsx";
import Users from "./assets/pages/Users.jsx";

function App() {
    const user = JSON.parse(localStorage.getItem("user"));
  const rol = user?.rol;
  return (
    <Router>
      {/* WRAPPER que asegura altura completa */}
      <div style={{ minHeight: "100vh", height: "100%" }}>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/unidades"
            element={
              <ProtectedRoute>
                <GestionUnidades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reparaciones"
            element={
              <ProtectedRoute>
                <RegistroReparaciones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/costos"
            element={
              <ProtectedRoute>
                <Costos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          {/* Redirección por defecto al login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
