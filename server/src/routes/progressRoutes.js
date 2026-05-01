import express from "express";
import {
  getProgress,
  getProgressValidators,
  recentlyRead,
  saveProgress,
  saveProgressValidators
} from "../controllers/progressController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post("/save", protect, saveProgressValidators, validate, saveProgress);
router.get("/get/:bookId", protect, getProgressValidators, validate, getProgress);
router.get("/recent", protect, recentlyRead);

export default router;
