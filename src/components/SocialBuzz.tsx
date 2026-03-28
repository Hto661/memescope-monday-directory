import type { SocialBuzzScore } from '@/lib/scoring';
import { cn } from '@/lib/utils';

interface SocialBuzzProps {
  buzz: SocialBuzzScore;
  compact?: boolean;
}

const levelConfig: Record<string, { color: string; bg: string; emoji: string }> = {
  Dead: { color: 'text-navy-400', bg: 'bg-navy-100', emoji: '💀' },
  Low: { color: 'text-navy-600', bg: 'bg-navy-100', emoji: '😴' },
  Moderate: { color: 'text-blue-600', bg: 'bg-blue-50', emoji: '👀' },
  Hot: { color: 'text-orange-600', bg: 'bg-orange-50', emoji: '🔥' },
  Viral: { color: 'text-red-600', bg: 'bg-red-50', emoji: '🚀' },
};

export function SocialBuzzCard({ buzz, compact = false }: SocialBuzzProps) {
  const config = levelConfig[buzz.label] ?? levelConfig.Low;

  if (compact) {
    return (
      <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full', config.bg, config.color)}>
        <span className="text-sm">{config.emoji}</span>
        <span className="text-xs font-semibold">{buzz.label}</span>
      </div>
    );
  }

  // Determine bar segments to fill
  const segments = 5;
  const filledSegments = Math.ceil((buzz.level / 100) * segments);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{config.emoji}</span>
          <h3 className="font-bold text-navy-900 text-sm">Social Buzz</h3>
        </div>
        <span className={cn('text-sm font-bold', config.color)}>{buzz.label}</span>
      </div>

      {/* Heat bar */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-2.5 flex-1 rounded-full transition-colors',
              i < filledSegments
                ? buzz.level >= 80
                  ? 'bg-red-400'
                  : buzz.level >= 55
                    ? 'bg-orange-400'
                    : buzz.level >= 30
                      ? 'bg-blue-400'
                      : 'bg-navy-300'
                : 'bg-navy-100'
            )}
          />
        ))}
      </div>

      {/* Signals */}
      {buzz.signals.length > 0 && (
        <div className="space-y-1.5">
          {buzz.signals.slice(0, 5).map((signal, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-navy-300 flex-shrink-0" />
              <span className="text-xs text-navy-600">{signal}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
