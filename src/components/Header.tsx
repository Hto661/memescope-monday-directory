'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from './AuthProvider';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/coins', label: 'Browse Coins' },
  { href: '/submit', label: 'Submit' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-navy-200">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center text-white font-black text-sm group-hover:bg-brand-600 transition-colors">
              MM
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-navy-900 text-sm leading-tight">Memescope</span>
              <span className="font-bold text-brand-600 text-sm leading-tight">Monday</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-navy-100 text-navy-900'
                    : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                )}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/watchlist"
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === '/watchlist'
                    ? 'bg-navy-100 text-navy-900'
                    : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                )}
              >
                Watchlist
              </Link>
            )}
          </nav>

          {/* Auth + CTA */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-9 bg-navy-100 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-navy-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-navy-700">{user.username}</span>
                </Link>
                <button
                  onClick={() => { logout(); window.location.href = '/'; }}
                  className="text-sm text-navy-500 hover:text-navy-700 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-navy-600 hover:text-navy-900 transition-colors px-3 py-2">
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary text-sm px-5 py-2.5">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-navy-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-navy-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-navy-100 mt-2 pt-3">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'bg-navy-100 text-navy-900'
                      : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link href="/watchlist" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-navy-600 hover:text-navy-900 hover:bg-navy-50">
                    Watchlist
                  </Link>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-navy-600 hover:text-navy-900 hover:bg-navy-50">
                    Profile
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); window.location.href = '/'; }}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-left"
                  >
                    Sign out
                  </button>
                </>
              )}
              {!user && (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-navy-600">
                    Sign in
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm px-5 py-2.5 mt-2">
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
