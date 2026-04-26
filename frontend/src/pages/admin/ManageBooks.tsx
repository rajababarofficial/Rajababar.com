import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Loader2, X, Check } from 'lucide-react';
import { apiFetch, getApiUrl } from '../../utils/api';
import { cn } from '../../utils/cn';

interface Book {
  id: number;
  title_en: string;
  author_en: string;
  category: string;
  publisher: string;
  year: string;
}

export default function ManageBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title_en: '', author_en: '', category: '', publisher: '', year: '', language: 'English', source_name: 'MHP', identifier: '', thumbnail: '', link: ''
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch(getApiUrl('/api/library/init-db'));
      // Note: init-db returns a sqlite file, but we can also fetch from a direct PG list if we had one.
      // For now, I'll use a mocked list or implement a list handler in CRUD if needed.
      // But let's assume we have a simple list endpoint.
      const listRes = await apiFetch('/api/library/sync?limit=50');
      const data = await listRes.json();
      setBooks(data.books || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingBook ? `/api/library/edit/${editingBook.id}` : '/api/library/add';
    const method = editingBook ? 'PUT' : 'POST';

    try {
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingBook(null);
        setFormData({ title_en: '', author_en: '', category: '', publisher: '', year: '', language: 'English', source_name: 'MHP', identifier: '', thumbnail: '', link: '' });
        fetchBooks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      const res = await apiFetch(`/api/library/delete/${id}`, { method: 'DELETE' });
      if (res.ok) fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({ ...formData, ...book });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Manage Books</h1>
          <p className="text-brand-secondary">Add, update, or remove books from the library.</p>
        </div>
        <button
          onClick={() => { setEditingBook(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-brand-accent text-white font-bold rounded-2xl hover:bg-brand-accent/90 transition-all shadow-lg shadow-brand-accent/20"
        >
          <Plus size={20} /> Add New Book
        </button>
      </header>

      <div className="glass p-4 rounded-[2rem] border border-brand-border/50 bg-brand-surface/20">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search books..."
            className="w-full pl-12 pr-4 py-4 bg-brand-bg/50 border border-brand-border rounded-2xl outline-none focus:border-brand-accent text-brand-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary" size={20} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border/30 text-[10px] font-bold text-brand-secondary uppercase tracking-widest">
                <th className="p-4">Title</th>
                <th className="p-4">Author</th>
                <th className="p-4">Category</th>
                <th className="p-4">Year</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-brand-accent mb-2" />
                    <p className="text-xs text-brand-secondary">Loading books...</p>
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-brand-secondary italic">No books found.</td>
                </tr>
              ) : (
                books.filter(b => b.title_en.toLowerCase().includes(searchTerm.toLowerCase())).map((book) => (
                  <tr key={book.id} className="hover:bg-brand-accent/5 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-brand-primary">{book.title_en}</div>
                      <div className="text-[10px] text-brand-secondary">{book.publisher}</div>
                    </td>
                    <td className="p-4 text-sm text-brand-secondary">{book.author_en}</td>
                    <td className="p-4 text-sm">
                      <span className="px-3 py-1 bg-brand-surface border border-brand-border rounded-full text-[10px] font-bold text-brand-secondary">
                        {book.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-brand-primary">{book.year}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(book)} className="p-2 bg-brand-surface border border-brand-border rounded-xl text-blue-500 hover:border-blue-500 transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(book.id)} className="p-2 bg-brand-surface border border-brand-border rounded-xl text-red-500 hover:border-red-500 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-bg/80 backdrop-blur-sm">
          <div className="glass max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-[2.5rem] border border-brand-border shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-brand-primary">{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-brand-surface rounded-full transition-colors">
                <X size={24} className="text-brand-secondary" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-secondary uppercase ml-1">Title (English)</label>
                <input
                  className="w-full p-4 bg-brand-surface border border-brand-border rounded-2xl outline-none focus:border-brand-accent text-brand-primary"
                  value={formData.title_en}
                  onChange={e => setFormData({ ...formData, title_en: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-secondary uppercase ml-1">Author (English)</label>
                <input
                  className="w-full p-4 bg-brand-surface border border-brand-border rounded-2xl outline-none focus:border-brand-accent text-brand-primary"
                  value={formData.author_en}
                  onChange={e => setFormData({ ...formData, author_en: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-secondary uppercase ml-1">Category</label>
                <input
                  className="w-full p-4 bg-brand-surface border border-brand-border rounded-2xl outline-none focus:border-brand-accent text-brand-primary"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-secondary uppercase ml-1">Year</label>
                <input
                  className="w-full p-4 bg-brand-surface border border-brand-border rounded-2xl outline-none focus:border-brand-accent text-brand-primary"
                  value={formData.year}
                  onChange={e => setFormData({ ...formData, year: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-brand-secondary uppercase ml-1">Publisher</label>
                <input
                  className="w-full p-4 bg-brand-surface border border-brand-border rounded-2xl outline-none focus:border-brand-accent text-brand-primary"
                  value={formData.publisher}
                  onChange={e => setFormData({ ...formData, publisher: e.target.value })}
                />
              </div>
              
              <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-brand-surface border border-brand-border rounded-2xl font-bold text-brand-secondary hover:bg-brand-bg transition-all">Cancel</button>
                <button type="submit" className="px-8 py-4 bg-brand-accent text-white rounded-2xl font-bold hover:bg-brand-accent/90 transition-all shadow-lg shadow-brand-accent/20 flex items-center gap-2">
                  <Check size={20} /> {editingBook ? 'Update Book' : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
