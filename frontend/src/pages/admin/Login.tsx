import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../utils/api';
import { Lock, User, Loader2 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        navigate('/admin/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="max-w-md w-full glass p-8 rounded-[2.5rem] border border-brand-border/50 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-brand-accent w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-brand-primary">Admin Login</h1>
          <p className="text-brand-secondary text-sm">Access the management dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-secondary uppercase tracking-widest ml-1">Username</label>
            <div className="relative">
              <input
                type="text"
                className="w-full pl-12 pr-4 py-4 bg-brand-surface/50 border border-brand-border rounded-2xl outline-none focus:border-brand-accent text-brand-primary"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary/50" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-secondary uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <input
                type="password"
                className="w-full pl-12 pr-4 py-4 bg-brand-surface/50 border border-brand-border rounded-2xl outline-none focus:border-brand-accent text-brand-primary"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary/50" size={20} />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
