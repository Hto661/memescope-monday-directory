'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { cn } from '@/lib/utils';

interface UpvoteButtonProps {
  slug: string;
  initialVotes: number;
  size?: 'sm' | 'md';
}

export function UpvoteButton({ slug, initialVotes, size = 'md' }: UpvoteButtonProps) {
  const { user } = useAuth();
  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleVote = async () => {
    if (hasVoted) return;

    if (!user) {
      window.location.href = '/login';
      return;
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    try {
      const res = await fetch(`/api/coins/${slug}/upvote`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setVotes(data.votes);
        if (!data.alreadyVoted) {
          setHasVoted(true);
        } else {
          setHasVoted(true);
        }
      } else if (res.status === 401) {
        window.location.href = '/login';
      }
    } catch {
      // silently fail
    }
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleVote();
      }}
      disabled={hasVoted}
      className={cn(
        'inline-flex flex-col items-center gap-0.5 rounded-lg border transition-all duration-200',
        size === 'sm' ? 'px-2 py-1.5 min-w-[44px]' : 'px-3 py-2 min-w-[56px]',
        hasVoted
          ? 'border-brand-200 bg-brand-50 text-brand-600 cursor-default'
          : 'border-navy-200 bg-white text-navy-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 cursor-pointer',
        isAnimating && 'scale-110'
      )}
      title={hasVoted ? 'Already voted' : user ? 'Upvote this coin' : 'Sign in to vote'}
    >
      <svg
        className={cn(
          'transition-transform duration-200',
          size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4',
          isAnimating && '-translate-y-0.5'
        )}
        fill={hasVoted ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
      <span className={cn('font-bold tabular-nums', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {votes}
      </span>
    </button>
  );
}
