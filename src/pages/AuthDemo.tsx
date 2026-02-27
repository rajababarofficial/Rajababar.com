import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Send, History, LayoutDashboard, PenTool } from 'lucide-react';

export default function MemberDashboard() {
  const [takhleeq, setTakhleeq] = useState('');
  const [category, setCategory] = useState('Shairi');
  const [title, setTitle] = useState('');
  const [myEntries, setMyEntries] = useState([
    { id: 1, title: 'Sindh Ji Saqafat', category: 'Tareekh', date: '2024-02-20' },
    { id: 2, title: 'Ghazal - Yaad', category: 'Shairi', date: '2024-02-15' },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      title: title,
      category: category,
      date: new Date().toISOString().split('T')[0]
    };
    setMyEntries([newEntry, ...myEntries]);
    setTitle('');
    setTakhleeq('');
    alert("Takhleeq submit ho gayi!");
  };

  return (
    <div className="min-h-screen bg-brand-bg text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-brand-accent">Member Portal</h1>
          <p className="text-brand-secondary text-sm">Welcome back, Ahmed Ali</p>
        </div>
        <LayoutDashboard className="text-brand-accent w-8 h-8" />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Submission Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-brand-surface border border-brand-border p-6 rounded-3xl shadow-xl">
            <div className="flex items-center mb-6 gap-2">
              <PenTool className="text-brand-accent w-5 h-5" />
              <h2 className="text-xl font-bold">Nayi Takhleeq Likhen</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-brand-secondary mb-2 block">Unwan (Title)</label>
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 focus:border-brand-accent outline-none"
                  placeholder="Apni takhleeq ka unwan likhen..."
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-brand-secondary mb-2 block">Topic / Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 focus:border-brand-accent outline-none"
                >
                  <option>Shairi</option>
                  <option>Tareekh</option>
                  <option>Tanqeed</option>
                  <option>Saqafat</option>
                  <option>General</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-brand-secondary mb-2 block">Tehreer (Content)</label>
                <textarea 
                  value={takhleeq}
                  onChange={(e) => setTakhleeq(e.target.value)}
                  rows={8}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 focus:border-brand-accent outline-none"
                  placeholder="Yahan apni shairi ya mazmoon likhen..."
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-brand-accent hover:bg-opacity-90 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Send size={18} />
                Submit Karain
              </button>
            </form>
          </div>
        </motion.div>

        {/* Right Column: Record/History */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-brand-surface border border-brand-border p-6 rounded-3xl h-full">
            <div className="flex items-center mb-6 gap-2">
              <History className="text-brand-secondary w-5 h-5" />
              <h2 className="text-xl font-bold">Mera Record</h2>
            </div>

            <div className="space-y-4">
              {myEntries.map((item) => (
                <div key={item.id} className="p-4 bg-brand-bg border border-brand-border rounded-2xl hover:border-brand-accent transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] bg-brand-accent/20 text-brand-accent px-2 py-1 rounded-md uppercase font-bold tracking-tighter">
                      {item.category}
                    </span>
                    <span className="text-xs text-brand-secondary">{item.date}</span>
                  </div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 text-brand-secondary border border-dashed border-brand-border rounded-xl hover:text-white transition-all">
              View All History
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}