import type { Chain } from '@/lib/types';
import { getChainInfo } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ChainBadgeProps {
  chain: Chain;
  size?: 'sm' | 'md';
}

export function ChainBadge({ chain, size = 'sm' }: ChainBadgeProps) {
  const info = getChainInfo(chain);

  return (
    <span
      className={cn(
        'chain-badge',
        info.bgColor,
        info.color,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      )}
    >
      <span>{info.icon}</span>
      <span>{info.name}</span>
    </span>
  );
}
