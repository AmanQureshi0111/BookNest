const BookCard = ({ book, onOpen, onDelete, onFavorite, canDelete }) => (
  <div className="card space-y-2">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold">{book.title}</h3>
        <p className="text-sm text-slate-300">by {book.author}</p>
        <p className="text-xs text-slate-400">Uploader: {book.uploadedBy?.username || "You"}</p>
      </div>
      <button
        type="button"
        onClick={() => onFavorite(book._id)}
        className="rounded-md border border-slate-700 px-2 py-1 text-xs"
      >
        ❤ {book.likes?.length || 0}
      </button>
    </div>
    <p className="text-sm text-slate-300">{book.description}</p>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onOpen(book._id)}
        className="rounded-md bg-indigo-600 px-3 py-1 text-sm hover:bg-indigo-500"
      >
        Read
      </button>
      {canDelete && (
        <button
          type="button"
          onClick={() => onDelete(book._id)}
          className="rounded-md border border-rose-500 px-3 py-1 text-sm text-rose-300 hover:bg-rose-900/30"
        >
          Delete
        </button>
      )}
    </div>
  </div>
);

export default BookCard;
