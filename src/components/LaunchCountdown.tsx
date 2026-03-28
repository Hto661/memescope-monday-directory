'use client';

import { useEffect, useState } from 'react';
import { getLaunchCountdown } from '@/lib/utils';

interface LaunchCountdownProps {
  launchDate: string;
  compact?: boolean;
}

export function LaunchCountdown({ launchDate, compact = false }: LaunchCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(getLaunchCountdown(launchDate));

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCountdown(getLaunchCountdown(launchDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [launchDate]);

  if (!mounted) {
    return <span className="text-xs text-navy-400">Loading...</span>;
  }

  if (countdown.passed) {
    return (
      <span className="inline-flex items-center gap-1.5 text-brand-600 font-semibold text-sm">
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
        Launched
      </span>
    );
  }

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-600 font-semibold text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {countdown.days > 0 && `${countdown.days}d `}
        {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
      </span>
    );
  }

  return (
    <div className="card p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🚀</span>
        <span className="font-bold text-amber-800 text-sm">Launching in</span>
      </div>
      <div className="flex items-center gap-2">
        {[
          { v: countdown.days, l: 'd' },
          { v: countdown.hours, l: 'h' },
          { v: countdown.minutes, l: 'm' },
          { v: countdown.seconds, l: 's' },
        ].map((u, i) => (
          <div key={u.l} className="flex items-center gap-2">
            <div className="bg-white rounded-md px-2.5 py-1.5 shadow-sm">
              <span className="text-lg font-bold text-amber-900 tabular-nums">{String(u.v).padStart(2, '0')}</span>
              <span className="text-xs text-amber-600 ml-0.5">{u.l}</span>
            </div>
            {i < 3 && <span className="text-amber-400 font-bold">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
