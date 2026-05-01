import express from "express";
import {
  addComment,
  allBooks,
  allBooksValidators,
  commentValidators,
  deleteBook,
  deleteValidators,
  favoriteValidators,
  serveBook,
  serveBookValidators,
  toggleFavorite,
  uploadBook,
  uploadValidators,
  userBooks
} from "../controllers/bookController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post("/upload", protect, upload.single("pdf"), uploadValidators, validate, uploadBook);
router.delete("/delete/:id", protect, deleteValidators, validate, deleteBook);
router.get("/all", protect, allBooksValidators, validate, allBooks);
router.get("/user", protect, userBooks);
router.get("/file/:id", protect, serveBookValidators, validate, serveBook);
router.post("/:id/favorite", protect, favoriteValidators, validate, toggleFavorite);
router.post("/:id/comments", protect, commentValidators, validate, addComment);

export default router;
