import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white mt-20">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center text-white font-black text-sm">
                MM
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-sm leading-tight">Memescope</span>
                <span className="font-bold text-brand-400 text-sm leading-tight">Monday</span>
              </div>
            </div>
            <p className="text-navy-400 text-sm leading-relaxed">
              The community directory for Memescope Monday. Discover, share, and ride together every Monday.
            </p>
          </div>

          {/* Directory */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-navy-300 uppercase tracking-wider">Directory</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/coins" className="text-navy-400 hover:text-white text-sm transition-colors">
                  Browse Coins
                </Link>
              </li>
              <li>
                <Link href="/coins?chain=solana" className="text-navy-400 hover:text-white text-sm transition-colors">
                  Solana Coins
                </Link>
              </li>
              <li>
                <Link href="/coins?chain=base" className="text-navy-400 hover:text-white text-sm transition-colors">
                  Base Coins
                </Link>
              </li>
              <li>
                <Link href="/coins?chain=bnb" className="text-navy-400 hover:text-white text-sm transition-colors">
                  BNB Chain Coins
                </Link>
              </li>
            </ul>
          </div>

          {/* Participate */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-navy-300 uppercase tracking-wider">Participate</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/submit" className="text-navy-400 hover:text-white text-sm transition-colors">
                  Submit a Coin
                </Link>
              </li>
              <li>
                <Link href="/" className="text-navy-400 hover:text-white text-sm transition-colors">
                  Featured Coins
                </Link>
              </li>
              <li>
                <Link href="/coins?sort=trending" className="text-navy-400 hover:text-white text-sm transition-colors">
                  Trending
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-navy-300 uppercase tracking-wider">Community</h3>
            <ul className="space-y-2.5">
              <li>
                <span className="text-navy-400 text-sm">Every Monday @ 10 AM EST</span>
              </li>
              <li>
                <span className="text-navy-400 text-sm">Open Memescope on Phantom</span>
              </li>
              <li>
                <span className="text-navy-400 text-sm">Find the play. Ride together.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-navy-500 text-sm">&copy; {new Date().getFullYear()} Memescope Monday. All rights reserved.</p>
          <p className="text-navy-600 text-xs">
            Disclaimer: This is a community directory. Not financial advice. DYOR. You can lose everything.
          </p>
        </div>
      </div>
    </footer>
  );
}
