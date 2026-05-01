import { useState } from "react";
import api from "../services/api";

const UploadBookForm = ({ onUploaded }) => {
  const [form, setForm] = useState({ title: "", author: "", description: "", pdf: null });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("author", form.author);
      payload.append("description", form.description);
      payload.append("pdf", form.pdf);
      await api.post("/books/upload", payload);
      setMessage("Uploaded.");
      setForm({ title: "", author: "", description: "", pdf: null });
      onUploaded();
    } catch (error) {
      setMessage(error.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card space-y-3" onSubmit={onSubmit}>
      <h2 className="text-lg font-semibold">Upload Book</h2>
      <input
        value={form.title}
        onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
        placeholder="Title"
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
        required
      />
      <input
        value={form.author}
        onChange={(e) => setForm((v) => ({ ...v, author: e.target.value }))}
        placeholder="Author"
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
        required
      />
      <textarea
        value={form.description}
        onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))}
        placeholder="Description"
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
      />
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setForm((v) => ({ ...v, pdf: e.target.files?.[0] || null }))}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-indigo-600 px-4 py-2 hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {message && <p className="text-sm text-slate-300">{message}</p>}
    </form>
  );
};

export default UploadBookForm;
