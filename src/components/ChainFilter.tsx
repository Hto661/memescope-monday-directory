'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CHAINS } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ChainFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeChain = searchParams.get('chain') ?? 'all';

  const handleFilter = (chain: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (chain === 'all') {
      params.delete('chain');
    } else {
      params.set('chain', chain);
    }
    router.push(`/coins?${params.toString()}`);
  };

  const filters = [{ id: 'all', name: 'All Chains', icon: '🌐' }, ...CHAINS];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => handleFilter(filter.id)}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150',
            activeChain === filter.id
              ? 'bg-navy-900 text-white shadow-md'
              : 'bg-navy-50 text-navy-600 hover:bg-navy-100 hover:text-navy-800'
          )}
        >
          <span>{filter.icon}</span>
          <span>{filter.name}</span>
        </button>
      ))}
    </div>
  );
}
