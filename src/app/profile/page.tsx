import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getUserVotedCoins, getUserWatchlist } from '@/lib/data';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const [votedCoinIds, watchlistCoins] = await Promise.all([
    getUserVotedCoins(user.id),
    getUserWatchlist(user.id),
  ]);

  return (
    <div>
      <div className="bg-gradient-to-b from-navy-50 to-white border-b border-navy-100">
        <div className="container-main py-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-black">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black text-navy-900">{user.username}</h1>
              <p className="text-navy-500 text-sm">{user.email}</p>
              <p className="text-navy-400 text-xs mt-1">Joined {formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="grid sm:grid-cols-3 gap-5 mb-10">
          <div className="card p-6 text-center">
            <p className="text-3xl font-black text-navy-900">{votedCoinIds.length}</p>
            <p className="text-sm text-navy-500 mt-1">Coins Voted</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-3xl font-black text-navy-900">{watchlistCoins.length}</p>
            <p className="text-sm text-navy-500 mt-1">Watchlist</p>
          </div>
          <Link href="/watchlist" className="card p-6 text-center hover:border-brand-300 transition-colors group">
            <p className="text-3xl mb-1">⭐</p>
            <p className="text-sm font-semibold text-navy-600 group-hover:text-brand-600">View Watchlist</p>
          </Link>
        </div>

        <div className="flex gap-3">
          <Link href="/coins" className="btn-outline">Browse Coins</Link>
          <Link href="/submit" className="btn-primary">Submit a Coin</Link>
        </div>
      </div>
    </div>
  );
}
