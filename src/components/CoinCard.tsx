import Link from 'next/link';
import type { Coin } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { ChainBadge } from './ChainBadge';
import { UpvoteButton } from './UpvoteButton';
import { LaunchCountdown } from './LaunchCountdown';

interface CoinCardProps {
  coin: Coin;
}

export function CoinCard({ coin }: CoinCardProps) {
  return (
    <div className="card flex group">
      {/* Upvote column */}
      <div className="flex items-start pt-5 pl-3">
        <UpvoteButton slug={coin.slug} initialVotes={coin.votes ?? 0} size="sm" />
      </div>

      {/* Content */}
      <Link href={`/coins/${coin.slug}`} className="flex-1 p-5 pl-3 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center text-lg font-bold text-navy-600 flex-shrink-0">
              {coin.ticker.replace('$', '').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-navy-900 text-sm truncate group-hover:text-brand-600 transition-colors">
                {coin.name}
              </h3>
              <p className="text-navy-500 text-xs font-medium">{coin.ticker}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {coin.coinType === 'upcoming' && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                Upcoming
              </span>
            )}
            <ChainBadge chain={coin.chain} />
          </div>
        </div>

        {/* Description */}
        <p className="text-navy-600 text-sm leading-relaxed line-clamp-2">{coin.description}</p>

        {/* Launch countdown for upcoming */}
        {coin.coinType === 'upcoming' && coin.launchDate && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-navy-400">Launch:</span>
            <LaunchCountdown launchDate={coin.launchDate} compact />
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between pt-2 border-t border-navy-100 mt-auto">
          <div className="flex items-center gap-2 flex-wrap">
            {coin.category && (
              <span className="text-xs font-medium text-navy-500 bg-navy-50 px-2 py-0.5 rounded">
                {coin.category}
              </span>
            )}
            {coin.featured && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                Featured
              </span>
            )}
            {(coin.trending || coin.paidTrending) && (
              <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                Trending
              </span>
            )}
            {coin.paidExpedited && (
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Verified
              </span>
            )}
          </div>
          <span className="text-xs text-navy-400">{formatDate(coin.submittedAt)}</span>
        </div>

        {/* Market cap if available */}
        {coin.marketCapAtSubmission && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-navy-400">Market Cap</span>
            <span className="text-xs font-semibold text-navy-700">{coin.marketCapAtSubmission}</span>
          </div>
        )}
      </Link>
    </div>
  );
}
