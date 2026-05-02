import { body, param, query } from "express-validator";
import { Book } from "../models/Book.js";
import { deleteStoredFile, getPdfContent, uploadPdfBuffer } from "../services/storageService.js";

export const uploadValidators = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("author").trim().notEmpty().withMessage("Author is required."),
  body("description").optional().trim()
];

export const uploadBook = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "PDF file is required." });
  }

  const stored = await uploadPdfBuffer({
    buffer: req.file.buffer,
    originalName: req.file.originalname
  });

  const book = await Book.create({
    title: req.body.title,
    author: req.body.author,
    description: req.body.description || "",
    uploadedBy: req.user._id,
    filePath: stored.filePath,
    fileUrl: stored.fileUrl
  });
  return res.status(201).json(book);
};

export const deleteValidators = [param("id").isMongoId().withMessage("Invalid book id.")];

export const deleteBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }
  if (String(book.uploadedBy) !== String(req.user._id)) {
    return res.status(403).json({ message: "You can only delete your own books." });
  }

  await book.deleteOne();
  await deleteStoredFile(book.filePath);
  return res.json({ message: "Book deleted." });
};

export const allBooksValidators = [
  query("search").optional().trim(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 })
];

export const allBooks = async (req, res) => {
  const search = req.query.search || "";
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);

  const filter = search
    ? {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ]
      }
    : {};

  const [books, total] = await Promise.all([
    Book.find(filter)
      .populate("uploadedBy", "username")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Book.countDocuments(filter)
  ]);

  return res.json({ books, page, totalPages: Math.ceil(total / limit), total });
};

export const userBooks = async (req, res) => {
  const books = await Book.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
  return res.json(books);
};

export const favoriteValidators = [param("id").isMongoId().withMessage("Invalid book id.")];
export const toggleFavorite = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }
  const userId = String(req.user._id);
  const idx = book.likes.findIndex((id) => String(id) === userId);
  if (idx >= 0) {
    book.likes.splice(idx, 1);
  } else {
    book.likes.push(req.user._id);
  }
  await book.save();
  return res.json({ likes: book.likes.length });
};

export const commentValidators = [
  param("id").isMongoId().withMessage("Invalid book id."),
  body("text").trim().isLength({ min: 1, max: 300 }).withMessage("Comment is required.")
];

export const addComment = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }
  book.comments.push({ user: req.user._id, text: req.body.text });
  await book.save();
  await book.populate("comments.user", "username");
  return res.status(201).json(book.comments.at(-1));
};

export const serveBookValidators = [param("id").isMongoId().withMessage("Invalid book id.")];
export const serveBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  try {
    const content = await getPdfContent({
      filePath: book.filePath,
      fileUrl: book.fileUrl
    });
    if (!content) {
      return res.status(404).json({
        message: "File missing on server. Re-upload this book."
      });
    }
    res.setHeader("Content-Type", content.contentType);
    return content.stream.pipe(res);
  } catch {
    return res.status(500).json({
      message: "Unable to stream PDF right now. Try re-uploading this book."
    });
  }
};
