import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getUserWatchlist } from '@/lib/data';
import { CoinCard } from '@/components/CoinCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function WatchlistPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const coins = await getUserWatchlist(user.id);

  return (
    <div>
      <div className="bg-gradient-to-b from-navy-50 to-white border-b border-navy-100">
        <div className="container-main py-12">
          <h1 className="text-3xl font-black text-navy-900 mb-2">Your Watchlist</h1>
          <p className="text-navy-500">Coins you&apos;re watching for Memescope Monday.</p>
        </div>
      </div>

      <div className="container-main py-8">
        {coins.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coins.map((coin) => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">Your watchlist is empty</h3>
            <p className="text-navy-500 text-sm mb-6">
              Browse coins and click the star to add them to your watchlist.
            </p>
            <Link href="/coins" className="btn-primary">Browse Coins</Link>
          </div>
        )}
      </div>
    </div>
  );
}
