import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api";
import BookCard from "../components/BookCard";
import ReaderPanel from "../components/ReaderPanel";
import UploadBookForm from "../components/UploadBookForm";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [myBooks, setMyBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [recent, setRecent] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBookId, setSelectedBookId] = useState(null);

  const loadBooks = async (targetPage = page, q = search) => {
    const [{ data: mine }, { data: lib }, { data: recentRead }] = await Promise.all([
      api.get("/books/user"),
      api.get("/books/all", { params: { page: targetPage, limit: 8, search: q } }),
      api.get("/progress/recent")
    ]);
    setMyBooks(mine);
    setAllBooks(lib.books);
    setTotalPages(lib.totalPages || 1);
    setRecent(recentRead);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const myBookIds = useMemo(() => new Set(myBooks.map((b) => b._id)), [myBooks]);

  const deleteBook = async (bookId) => {
    await api.delete(`/books/delete/${bookId}`);
    await loadBooks();
  };

  const favoriteBook = async (bookId) => {
    await api.post(`/books/${bookId}/favorite`);
    await loadBooks();
  };

  const onSearch = async (e) => {
    e.preventDefault();
    setPage(1);
    await loadBooks(1, search);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px,1fr]">
        <aside className="card space-y-3 h-fit">
          <h2 className="text-xl font-bold">BookNest</h2>
          <p className="text-sm text-slate-300">Hi, {user.username}</p>
          <button className="rounded border border-slate-700 px-3 py-2 hover:bg-slate-800" onClick={logout}>
            Logout
          </button>
          <UploadBookForm onUploaded={loadBooks} />
        </aside>

        <main className="space-y-4">
          {selectedBookId ? (
            <ReaderPanel bookId={selectedBookId} onClose={() => setSelectedBookId(null)} />
          ) : (
            <>
              <section className="card">
                <form onSubmit={onSearch} className="flex gap-2">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search title, author, description"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                  />
                  <button className="rounded-lg bg-indigo-600 px-4 py-2">Search</button>
                </form>
              </section>

              <section className="card">
                <h3 className="mb-2 text-lg font-semibold">Recently Read</h3>
                {recent.length ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {recent.map((entry) => (
                      <div key={entry._id} className="rounded border border-slate-800 p-2 text-sm">
                        <div>{entry.book?.title || "Unknown book"}</div>
                        <div className="text-slate-400">{entry.percentageCompleted}% completed</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No reading history yet.</p>
                )}
              </section>

              <section className="card space-y-3">
                <h3 className="text-lg font-semibold">Public Library</h3>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {allBooks.map((book) => (
                    <BookCard
                      key={book._id}
                      book={book}
                      onOpen={setSelectedBookId}
                      onDelete={deleteBook}
                      onFavorite={favoriteBook}
                      canDelete={myBookIds.has(book._id)}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    disabled={page <= 1}
                    className="rounded border border-slate-700 px-3 py-1 disabled:opacity-40"
                    onClick={async () => {
                      const next = Math.max(1, page - 1);
                      setPage(next);
                      await loadBooks(next, search);
                    }}
                  >
                    Prev
                  </button>
                  <span className="text-sm">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    className="rounded border border-slate-700 px-3 py-1 disabled:opacity-40"
                    onClick={async () => {
                      const next = Math.min(totalPages, page + 1);
                      setPage(next);
                      await loadBooks(next, search);
                    }}
                  >
                    Next
                  </button>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
