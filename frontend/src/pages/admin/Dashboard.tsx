import React from 'react';
import { LayoutGrid, Book, Tag, Users, ArrowUpRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const stats = [
    { label: 'Total Books', value: '12,450', icon: <Book className="text-blue-500" />, change: '+12%', color: 'bg-blue-500/10' },
    { label: 'Categories', value: '48', icon: <Tag className="text-purple-500" />, change: '+2', color: 'bg-purple-500/10' },
    { label: 'Active Users', value: '1,205', icon: <Users className="text-green-500" />, change: '+5%', color: 'bg-green-500/10' },
    { label: 'Total Visits', value: '45.2k', icon: <LayoutGrid className="text-orange-500" />, change: '+18%', color: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-brand-primary">Dashboard Overview</h1>
        <p className="text-brand-secondary">Welcome back, Admin. Here's what's happening today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-[2rem] border border-brand-border/50 bg-brand-surface/20">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                {stat.change} <ArrowUpRight size={10} />
              </span>
            </div>
            <p className="text-xs font-bold text-brand-secondary uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold text-brand-primary mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] border border-brand-border/50 bg-brand-surface/20">
          <h2 className="text-xl font-bold text-brand-primary mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-4 py-3 border-b border-brand-border/30 last:border-0">
                <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center">
                  <Clock size={16} className="text-brand-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-brand-primary font-medium">New book added: "History of Sindh"</p>
                  <p className="text-xs text-brand-secondary">2 hours ago by System</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass p-8 rounded-[2.5rem] border border-brand-border/50 bg-brand-surface/20">
            <h2 className="text-xl font-bold text-brand-primary mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <Link to="/admin/books" className="flex items-center justify-between p-4 bg-brand-bg/50 rounded-2xl border border-brand-border hover:border-brand-accent transition-all group">
                <span className="text-sm font-bold text-brand-primary">Manage Books</span>
                <ArrowUpRight size={16} className="text-brand-secondary group-hover:text-brand-accent" />
              </Link>
              <Link to="/admin/categories" className="flex items-center justify-between p-4 bg-brand-bg/50 rounded-2xl border border-brand-border hover:border-brand-accent transition-all group">
                <span className="text-sm font-bold text-brand-primary">Manage Categories</span>
                <ArrowUpRight size={16} className="text-brand-secondary group-hover:text-brand-accent" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
