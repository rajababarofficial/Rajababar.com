import React, { useState } from 'react';
import { Plus, Tag, Edit2, Trash2, Search, Check, X } from 'lucide-react';

export default function ManageCategories() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'History', count: 1240 },
    { id: 2, name: 'Literature', count: 850 },
    { id: 3, name: 'Geography', count: 420 },
    { id: 4, name: 'Science', count: 310 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Categories</h1>
          <p className="text-brand-secondary">Organize books into thematic categories.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-accent text-white font-bold rounded-2xl shadow-lg shadow-brand-accent/20"
        >
          <Plus size={20} /> Add Category
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="glass p-6 rounded-[2rem] border border-brand-border/50 bg-brand-surface/20 group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-2xl bg-brand-accent/10">
                <Tag className="text-brand-accent" size={24} />
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-brand-bg rounded-xl text-blue-500 transition-colors"><Edit2 size={16} /></button>
                <button className="p-2 hover:bg-brand-bg rounded-xl text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-brand-primary">{cat.name}</h3>
            <p className="text-sm text-brand-secondary mt-1">{cat.count} books assigned</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-bg/80 backdrop-blur-sm">
          <div className="glass max-w-md w-full p-8 rounded-[2.5rem] border border-brand-border shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-brand-primary">New Category</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-brand-secondary" /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-secondary uppercase ml-1">Category Name</label>
                <input
                  className="w-full p-4 bg-brand-surface border border-brand-border rounded-2xl outline-none focus:border-brand-accent text-brand-primary"
                  placeholder="e.g. Archaeology"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
              </div>
              <button className="w-full py-4 bg-brand-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2">
                <Check size={20} /> Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
