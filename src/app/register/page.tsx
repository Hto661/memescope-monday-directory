'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, username, password);
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-main py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-navy-900 mb-2">Create an account</h1>
          <p className="text-navy-500">Join to vote, build watchlists, and chat in the trollbox.</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-navy-900 mb-2">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" placeholder="you@example.com" />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-navy-900 mb-2">Username</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} maxLength={20} pattern="[a-zA-Z0-9_]+" className="input-field" placeholder="degen_trader" />
            <p className="text-xs text-navy-400 mt-1">Letters, numbers, and underscores only. 3-20 characters.</p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-navy-900 mb-2">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input-field" placeholder="At least 6 characters" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-sm text-navy-500 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
