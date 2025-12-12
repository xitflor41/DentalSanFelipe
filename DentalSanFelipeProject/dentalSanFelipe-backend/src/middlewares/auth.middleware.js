// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "cambia_esto";

export const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "No autorizado" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id_usuario, username, rol }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "No autorizado" });
    if (!allowedRoles.includes(req.user.rol)) return res.status(403).json({ message: "Acceso denegado" });
    next();
  };
};
