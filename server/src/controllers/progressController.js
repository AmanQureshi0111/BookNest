import { body, param } from "express-validator";
import { Progress } from "../models/Progress.js";

export const saveProgressValidators = [
  body("bookId").isMongoId().withMessage("bookId is required."),
  body("lastPageRead").isInt({ min: 1 }).withMessage("lastPageRead must be >= 1."),
  body("totalPages").isInt({ min: 1 }).withMessage("totalPages must be >= 1."),
  body("bookmarks").optional().isArray(),
  body("highlights").optional().isArray()
];

export const saveProgress = async (req, res) => {
  const { bookId, lastPageRead, totalPages, bookmarks = [], highlights = [] } = req.body;
  const percentageCompleted = Math.min(100, Math.round((lastPageRead / totalPages) * 100));

  const progress = await Progress.findOneAndUpdate(
    { user: req.user._id, book: bookId },
    { lastPageRead, totalPages, percentageCompleted, bookmarks, highlights },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.json(progress);
};

export const getProgressValidators = [param("bookId").isMongoId().withMessage("Invalid book id.")];

export const getProgress = async (req, res) => {
  const progress = await Progress.findOne({ user: req.user._id, book: req.params.bookId });
  if (!progress) {
    return res.json({
      lastPageRead: 1,
      totalPages: 1,
      percentageCompleted: 0,
      bookmarks: [],
      highlights: []
    });
  }
  return res.json(progress);
};

export const recentlyRead = async (req, res) => {
  const items = await Progress.find({ user: req.user._id })
    .populate("book")
    .sort({ updatedAt: -1 })
    .limit(10);
  return res.json(items);
};
