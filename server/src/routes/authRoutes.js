import express from "express";
import {
  login,
  loginValidators,
  register,
  registerValidators
} from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post("/register", registerValidators, validate, register);
router.post("/login", loginValidators, validate, login);

export default router;
