import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_username', res.data.username);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0C12] flex items-center justify-center px-5">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <span className="text-cyan-400 text-2xl font-display font-bold">✦</span>
          </div>
          <h1 className="font-display font-bold text-white text-2xl">Admin Portal</h1>
          <p className="text-slate-500 text-sm mt-1 font-mono">Workshop Attendance System</p>
        </div>

        <div className="bg-[#0F1220] border border-[#1E2440] rounded-2xl p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                autoFocus
                className="w-full bg-[#161A2B] border border-[#2A3155] rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#161A2B] border border-[#2A3155] rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono"
              />
            </div>

            {error && (
              <p className="text-rose-400 text-sm bg-rose-400/10 border border-rose-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0C12] font-display font-bold py-3.5 rounded-xl transition-all mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6 font-mono">
          Teacher attendance portal: <a href="/attendance" className="text-cyan-400/60 hover:text-cyan-400">/attendance</a>
        </p>
      </div>
    </div>
  );
}
