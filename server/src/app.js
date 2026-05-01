import "express-async-errors";
import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(compression());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS blocked for this origin."));
    }
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/progress", progressRoutes);

app.use((_req, res) => res.status(404).json({ message: "Route not found." }));

app.use((err, _req, res, _next) => {
  if (err.message === "Only PDF files are allowed.") {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large. Maximum 10MB." });
  }
  if (err.message === "CORS blocked for this origin.") {
    return res.status(403).json({ message: err.message });
  }
  return res.status(500).json({ message: "Internal server error." });
});

export default app;
