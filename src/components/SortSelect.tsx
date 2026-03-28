'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('sort') ?? 'recommended';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === 'recommended') {
      params.delete('sort');
    } else {
      params.set('sort', e.target.value);
    }
    router.push(`/coins?${params.toString()}`);
  };

  return (
    <select value={current} onChange={handleChange} className="select-field text-sm py-2 px-3 pr-8">
      <option value="recommended">Recommended</option>
      <option value="votes">Most Upvoted</option>
      <option value="trending">Trending</option>
      <option value="newest">Newest</option>
      <option value="name">Name (A-Z)</option>
      <option value="oldest">Oldest</option>
    </select>
  );
}
