import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    lastPageRead: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
    percentageCompleted: { type: Number, default: 0 },
    bookmarks: [{ type: Number }],
    highlights: [
      {
        page: Number,
        text: String
      }
    ]
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, book: 1 }, { unique: true });

export const Progress = mongoose.model("Progress", progressSchema);
