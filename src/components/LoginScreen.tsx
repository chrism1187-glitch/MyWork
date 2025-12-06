'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
  onLogin: (email: string, name: string, role: string) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !name.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Check if user exists
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, createIfNotExists: true }),
      });

      if (response.ok) {
        const user = await response.json();
        toast.success(`Welcome, ${user.name}!`);
        onLogin(user.email, user.name, user.role || 'user');
      } else {
        toast.error('Failed to login');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoUsers = [
    { email: 'john@example.com', name: 'John Smith' },
    { email: 'admin@example.com', name: 'Admin User' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-700 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Job Manager Pro</h1>
          <p className="text-slate-600">Professional job management and scheduling</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-emerald-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition disabled:bg-gray-400 text-base"
          >
            {loading ? 'Logging in...' : 'Login / Sign Up'}
          </button>
        </form>

        <div className="mt-8 border-t-2 border-slate-200 pt-6">
          <p className="text-center text-sm text-slate-600 mb-4">Demo accounts:</p>
          <div className="space-y-2">
            {demoUsers.map((user) => (
              <button
                key={user.email}
                onClick={() => {
                  setEmail(user.email);
                  setName(user.name);
                }}
                className="w-full p-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition text-sm"
              >
                {user.name} ({user.email})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
