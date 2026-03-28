import type { SafetyScore as SafetyScoreType } from '@/lib/scoring';
import { cn } from '@/lib/utils';

interface SafetyScoreProps {
  score: SafetyScoreType;
  compact?: boolean;
}

const gradeColors: Record<string, { bg: string; text: string; ring: string }> = {
  A: { bg: 'bg-brand-50', text: 'text-brand-700', ring: 'ring-brand-200' },
  B: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200' },
  C: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' },
  D: { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200' },
  F: { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200' },
};

const statusIcons: Record<string, string> = {
  good: '✓',
  warning: '⚠',
  danger: '✗',
};

const statusColors: Record<string, string> = {
  good: 'text-brand-600',
  warning: 'text-amber-500',
  danger: 'text-red-500',
};

export function SafetyScoreCard({ score, compact = false }: SafetyScoreProps) {
  const colors = gradeColors[score.grade] ?? gradeColors.C;

  if (compact) {
    return (
      <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ring-1', colors.bg, colors.text, colors.ring)}>
        <span className="font-black text-sm">{score.grade}</span>
        <span className="text-xs font-medium">{score.overall}/100</span>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-navy-100 bg-navy-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🛡️</span>
            <h3 className="font-bold text-navy-900 text-sm">Safety Score</h3>
          </div>
          <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full ring-1', colors.bg, colors.text, colors.ring)}>
            <span className="font-black text-lg leading-none">{score.grade}</span>
            <span className="text-sm font-semibold">{score.overall}/100</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-4">
        <div className="w-full h-2.5 bg-navy-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              score.overall >= 65 ? 'bg-brand-500' : score.overall >= 40 ? 'bg-amber-400' : 'bg-red-400'
            )}
            style={{ width: `${score.overall}%` }}
          />
        </div>
      </div>

      {/* Factors */}
      <div className="p-5 space-y-3">
        {score.factors.map((factor) => (
          <div key={factor.name} className="flex items-start gap-2.5">
            <span className={cn('text-sm mt-0.5 font-bold', statusColors[factor.status])}>
              {statusIcons[factor.status]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-navy-800">{factor.name}</span>
                <span className="text-xs text-navy-400 tabular-nums">{factor.score}/100</span>
              </div>
              <p className="text-xs text-navy-500 mt-0.5">{factor.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pb-4">
        <p className="text-xs text-navy-400 leading-relaxed">
          Safety scores are algorithmic estimates based on on-chain data, liquidity, and social signals. Not financial advice.
        </p>
      </div>
    </div>
  );
}
