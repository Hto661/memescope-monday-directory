'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { cn } from '@/lib/utils';

interface WatchlistButtonProps {
  coinId: string;
  size?: 'sm' | 'md';
}

export function WatchlistButton({ coinId, size = 'md' }: WatchlistButtonProps) {
  const { user } = useAuth();
  const [watching, setWatching] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/watchlist/check?coinId=${coinId}`)
      .then((res) => res.json())
      .then((data) => setWatching(data.watching))
      .catch(() => {});
  }, [user, coinId]);

  if (!user) return null;

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinId, action: watching ? 'remove' : 'add' }),
      });
      if (res.ok) {
        const data = await res.json();
        setWatching(data.watching);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border transition-all',
        size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        watching
          ? 'border-amber-300 bg-amber-50 text-amber-700'
          : 'border-navy-200 bg-white text-navy-500 hover:border-amber-300 hover:text-amber-600'
      )}
      title={watching ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <svg
        className={cn(size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')}
        fill={watching ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
      {watching ? 'Watching' : 'Watch'}
    </button>
  );
}
