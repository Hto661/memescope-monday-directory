import Link from 'next/link';
import { getApprovedCoins, getFeaturedCoins, getTrendingCoins, getStats } from '@/lib/data';
import { CoinCard } from '@/components/CoinCard';
import { CountdownTimer } from '@/components/CountdownTimer';
import { CHAINS } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [featured, trending, allCoins, stats] = await Promise.all([
    getFeaturedCoins(),
    getTrendingCoins(),
    getApprovedCoins(),
    getStats(),
  ]);

  const latest = [...allCoins].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  const upcoming = allCoins.filter((c) => c.coinType === 'upcoming');

  const { totalCoins, totalVotes, totalUsers } = stats;

  return (
    <div>
      {/* Status bar */}
      <div className="bg-navy-900 text-white py-2">
        <div className="container-main flex items-center justify-center gap-3 text-sm">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          <span className="font-medium">NEXT MEMESCOPE MONDAY</span>
          <span className="text-navy-400">|</span>
          <span className="font-bold text-brand-400">{totalCoins} coins</span>
          <span className="text-navy-400">&middot;</span>
          <span className="font-bold text-brand-400">{totalVotes} votes</span>
          <span className="text-navy-400">&middot;</span>
          <span className="font-bold text-brand-400">{totalUsers} members</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-50 via-white to-brand-50" />
        <div className="relative container-main py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-full text-sm font-semibold mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Every Monday @ 10 AM UTC
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-navy-900 leading-[1.1] mb-6">
                Memescope
                <br />
                <span className="text-gradient">Monday</span>
              </h1>

              <p className="text-lg text-navy-600 leading-relaxed mb-8 max-w-lg">
                The community directory for Memescope Monday plays. Submit your picks from Solana PumpFun,
                Base, or BNB Chain. Upvote the best. Ride together.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/submit" className="btn-primary text-base px-8 py-3.5">
                  Submit a Coin
                </Link>
                <Link href="/coins" className="btn-outline text-base px-8 py-3.5">
                  Browse Directory
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="text-center mb-2">
                <p className="text-sm font-semibold text-navy-500 uppercase tracking-wider mb-3">
                  Next Memescope Monday in
                </p>
                <CountdownTimer />
              </div>

              {/* Chain stats */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-sm mt-4">
                {CHAINS.map((chain) => {
                  const count = allCoins.filter((c) => c.chain === chain.id).length;
                  return (
                    <Link
                      key={chain.id}
                      href={`/coins?chain=${chain.id}`}
                      className="card p-4 text-center hover:scale-105 transition-transform"
                    >
                      <div className="text-2xl mb-1">{chain.icon}</div>
                      <div className="text-lg font-bold text-navy-900">{count}</div>
                      <div className="text-xs text-navy-500">{chain.name}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Coins */}
      {featured.length > 0 && (
        <section className="container-main py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-navy-900">Featured Coins</h2>
              <p className="text-navy-500 text-sm mt-1">Hand-picked picks from the community</p>
            </div>
            <Link href="/coins?featured=true" className="text-sm font-semibold text-navy-600 hover:text-navy-900 transition-colors">
              View all &rarr;
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.slice(0, 6).map((coin) => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
          </div>
        </section>
      )}

      {/* Trending — sorted by votes */}
      {trending.length > 0 && (
        <section className="bg-navy-50/50">
          <div className="container-main py-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="text-brand-600 font-bold text-lg">&#x2197;</span>
                <div>
                  <h2 className="text-2xl font-bold text-navy-900">Trending</h2>
                  <p className="text-navy-500 text-sm mt-1">Most upvoted coins this week</p>
                </div>
              </div>
              <Link href="/coins?sort=votes" className="text-sm font-semibold text-navy-600 hover:text-navy-900 transition-colors">
                View all &rarr;
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {trending.slice(0, 4).map((coin) => (
                <CoinCard key={coin.id} coin={coin} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Launches */}
      {upcoming.length > 0 && (
        <section className="container-main py-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-amber-500 font-bold text-lg">🚀</span>
              <div>
                <h2 className="text-2xl font-bold text-navy-900">Upcoming Launches</h2>
                <p className="text-navy-500 text-sm mt-1">Coins launching this Monday</p>
              </div>
            </div>
            <Link href="/coins?type=upcoming" className="text-sm font-semibold text-navy-600 hover:text-navy-900 transition-colors">
              View all &rarr;
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcoming.slice(0, 3).map((coin) => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Submissions */}
      <section className="bg-navy-50/50">
        <div className="container-main py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-navy-900">Latest Submissions</h2>
              <p className="text-navy-500 text-sm mt-1">Fresh picks from the community</p>
            </div>
            <Link href="/coins?sort=newest" className="text-sm font-semibold text-navy-600 hover:text-navy-900 transition-colors">
              View all &rarr;
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {latest.slice(0, 6).map((coin) => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-900">
        <div className="container-main py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Got a play for next Monday?
          </h2>
          <p className="text-navy-400 text-lg mb-8 max-w-xl mx-auto">
            Submit your memecoin pick and let the community discover it. Pay for expedited review or
            trending placement to get maximum visibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/submit" className="btn-brand text-base px-10 py-4">
              Submit Your Coin
            </Link>
            <Link href="/coins" className="inline-flex items-center justify-center px-10 py-4 rounded-lg border-2 border-navy-600 text-navy-300 font-semibold text-base hover:border-navy-400 hover:text-white transition-colors">
              Browse Directory
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-main py-16">
        <h2 className="text-2xl font-bold text-navy-900 text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div className="max-w-2xl mx-auto space-y-6">
          {[
            {
              q: 'What is Memescope Monday?',
              a: 'Memescope Monday is a community event every Monday at 10 AM UTC where traders use the Memescope feature in Phantom wallet to discover and trade early memecoins together. The collective activity creates massive volume and opportunity.',
            },
            {
              q: 'How do I participate?',
              a: 'Open Phantom wallet, navigate to Memescope, and browse new coin launches starting at 10 AM UTC on Monday. Look for coins with strong community interest, cute branding, or cultural relevance. Always DYOR and never invest more than you can afford to lose.',
            },
            {
              q: 'Can I submit upcoming launches?',
              a: 'Yes! You can submit both existing coins and upcoming launches. For upcoming launches, specify the launch date and a countdown will be displayed on your listing so the community knows exactly when to look.',
            },
            {
              q: 'How does upvoting work?',
              a: 'Anyone can upvote a coin once. Coins with more votes rank higher in the directory and appear in the Trending section. This helps the community surface the best picks organically.',
            },
            {
              q: 'What are paid features?',
              a: 'You can pay for Expedited Review ($19) to get your listing approved within 1 hour, or Trending Placement ($49) for 24 hours in the Trending section. A bundle of both is available for $59.',
            },
            {
              q: 'What chains are supported?',
              a: 'We support Solana (PumpFun and other launchpads), Base, and BNB Chain projects. Solana is the primary chain for Memescope Monday.',
            },
            {
              q: 'Is this financial advice?',
              a: 'Absolutely not. This is a community directory. Memecoins are extremely risky and you can lose 100% of your investment. Always do your own research (DYOR). Never invest more than you can afford to lose.',
            },
          ].map((faq) => (
            <details key={faq.q} className="group border border-navy-200 rounded-xl">
              <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-navy-900 font-semibold hover:bg-navy-50 rounded-xl transition-colors">
                {faq.q}
                <svg
                  className="w-5 h-5 text-navy-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-4 text-navy-600 text-sm leading-relaxed">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
