'use client';

import { useEffect, useState } from 'react';
import { getNextMondayUTC, getCountdown } from '@/lib/utils';

export function CountdownTimer() {
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    const target = getNextMondayUTC();

    const update = () => setCountdown(getCountdown(target));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        {['Days', 'Hours', 'Min', 'Sec'].map((label) => (
          <div key={label} className="text-center">
            <div className="bg-navy-800 rounded-lg w-16 h-16 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">--</span>
            </div>
            <span className="text-xs text-navy-400 mt-1 block">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  const isLive =
    countdown.days === 0 &&
    countdown.hours === 0 &&
    countdown.minutes === 0 &&
    countdown.seconds === 0;

  if (isLive) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl animate-pulse">
          <span className="w-3 h-3 rounded-full bg-white animate-ping" />
          <span className="text-xl font-black">MEMESCOPE MONDAY IS LIVE!</span>
        </div>
      </div>
    );
  }

  const units = [
    { value: countdown.days, label: 'Days' },
    { value: countdown.hours, label: 'Hours' },
    { value: countdown.minutes, label: 'Min' },
    { value: countdown.seconds, label: 'Sec' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-3">
            <div className="text-center">
              <div className="bg-navy-800 rounded-lg w-16 h-16 flex items-center justify-center">
                <span className="text-2xl font-bold text-white tabular-nums">
                  {String(unit.value).padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs text-navy-400 mt-1.5 block">{unit.label}</span>
            </div>
            {i < units.length - 1 && (
              <span className="text-2xl font-bold text-navy-600 -mt-5">:</span>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-navy-400 mt-3 text-center">Monday 10:00 AM UTC</p>
    </div>
  );
}
