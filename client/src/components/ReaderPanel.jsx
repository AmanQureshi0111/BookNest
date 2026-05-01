import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import api from "../services/api";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const ReaderPanel = ({ bookId, onClose }) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [dark, setDark] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [highlightText, setHighlightText] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfError, setPdfError] = useState("");

  useEffect(() => {
    const loadProgress = async () => {
      const { data } = await api.get(`/progress/get/${bookId}`);
      setPageNumber(data.lastPageRead || 1);
      setBookmarks(data.bookmarks || []);
      setHighlights(data.highlights || []);
    };
    loadProgress();
  }, [bookId]);

  useEffect(() => {
    let objectUrl = "";

    const loadPdf = async () => {
      setPdfError("");
      setPdfUrl("");
      try {
        const response = await api.get(`/books/file/${bookId}`, { responseType: "arraybuffer" });
        const contentType = String(response.headers?.["content-type"] || "").toLowerCase();

        if (!contentType.includes("application/pdf")) {
          const text = new TextDecoder().decode(response.data);
          try {
            const parsed = JSON.parse(text);
            setPdfError(parsed.message || "Failed to load PDF file.");
            return;
          } catch {
            setPdfError(text || "Failed to load PDF file.");
            return;
          }
        }

        const blob = new Blob([response.data], { type: "application/pdf" });
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (error) {
        const payload = error.response?.data;
        if (payload instanceof ArrayBuffer) {
          const text = new TextDecoder().decode(payload);
          try {
            const parsed = JSON.parse(text);
            setPdfError(parsed.message || "Failed to load PDF file.");
            return;
          } catch {
            setPdfError(text || "Failed to load PDF file.");
            return;
          }
        }
        setPdfError(payload?.message || error.message || "Failed to load PDF file.");
      }
    };

    loadPdf();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [bookId]);

  useEffect(() => {
    if (!numPages) return;
    const save = async () => {
      await api.post("/progress/save", {
        bookId,
        lastPageRead: pageNumber,
        totalPages: numPages,
        bookmarks,
        highlights
      });
    };
    save();
  }, [bookId, pageNumber, numPages, bookmarks, highlights]);

  const toggleBookmark = () => {
    setBookmarks((prev) =>
      prev.includes(pageNumber) ? prev.filter((p) => p !== pageNumber) : [...prev, pageNumber]
    );
  };

  const addHighlight = () => {
    if (!highlightText.trim()) return;
    setHighlights((prev) => [...prev, { page: pageNumber, text: highlightText.trim() }]);
    setHighlightText("");
  };

  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className="rounded border border-slate-700 px-2 py-1" onClick={onClose}>
          Back
        </button>
        <button
          className="rounded border border-slate-700 px-2 py-1"
          onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span>
          Page {pageNumber} / {numPages || "-"}
        </span>
        <button
          className="rounded border border-slate-700 px-2 py-1"
          onClick={() => setPageNumber((p) => Math.min(numPages || p, p + 1))}
        >
          Next
        </button>
        <button className="rounded border border-slate-700 px-2 py-1" onClick={() => setScale((s) => s + 0.1)}>
          Zoom +
        </button>
        <button
          className="rounded border border-slate-700 px-2 py-1"
          onClick={() => setScale((s) => Math.max(0.7, s - 0.1))}
        >
          Zoom -
        </button>
        <button className="rounded border border-slate-700 px-2 py-1" onClick={() => setDark((v) => !v)}>
          {dark ? "Light" : "Dark"} mode
        </button>
        <button className="rounded border border-slate-700 px-2 py-1" onClick={toggleBookmark}>
          {bookmarks.includes(pageNumber) ? "Unbookmark" : "Bookmark"}
        </button>
      </div>

      <div className={`${dark ? "bg-slate-950" : "bg-slate-50"} overflow-auto rounded-lg p-2`}>
        {pdfError ? (
          <p className="p-4 text-sm text-rose-400">{pdfError}</p>
        ) : pdfUrl ? (
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages: pages }) => setNumPages(pages)}
            onLoadError={(error) => setPdfError(error.message || "Failed to load PDF file.")}
          >
            <Page pageNumber={pageNumber} scale={scale} />
          </Document>
        ) : (
          <p className="p-4 text-sm text-slate-400">Loading PDF...</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            value={highlightText}
            onChange={(e) => setHighlightText(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            placeholder="Highlight note for this page"
          />
          <button onClick={addHighlight} className="rounded bg-indigo-600 px-3 py-2">
            Add
          </button>
        </div>
        <div className="text-sm text-slate-300">
          <strong>Bookmarks:</strong> {bookmarks.length ? bookmarks.join(", ") : "none"}
        </div>
        <div className="text-sm text-slate-300">
          <strong>Highlights:</strong>{" "}
          {highlights.length
            ? highlights.map((h, i) => `#${i + 1}(p${h.page}): ${h.text}`).join(" | ")
            : "none"}
        </div>
      </div>
    </div>
  );
};

export default ReaderPanel;
