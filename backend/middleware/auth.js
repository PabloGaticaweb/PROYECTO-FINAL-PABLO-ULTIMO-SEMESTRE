import jwt from "jsonwebtoken";

export const auth = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles]; // Convertir string a array si es un solo rol
  }

  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No autorizado, token faltante" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Si hay roles definidos y el rol del usuario no está permitido
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Acceso denegado (rol insuficiente)" });
      }

      req.user = decoded;
      next();
    } catch (e) {
      return res.status(403).json({ message: "Token inválido" });
    }
  };
};
