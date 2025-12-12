// src/routes/auth.routes.js
import { Router } from "express";
import { 
  login, 
  register, 
  refreshToken,
  logout 
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;