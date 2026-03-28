'use client';

import { useState, useEffect } from 'react';
import type { NewsArticle } from '@/lib/news';

interface NewsFeedProps {
  query: string;
}

export function NewsFeed({ query }: NewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/news?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [query]);

  const sentimentColor = (s?: string) => {
    if (s === 'positive') return 'text-brand-600 bg-brand-50';
    if (s === 'negative') return 'text-red-600 bg-red-50';
    return 'text-navy-500 bg-navy-50';
  };

  const sentimentLabel = (s?: string) => {
    if (s === 'positive') return 'Bullish';
    if (s === 'negative') return 'Bearish';
    return 'Neutral';
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return `${Math.floor(diff / (1000 * 60))}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-navy-100 bg-navy-50 hover:bg-navy-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📰</span>
          <h3 className="font-bold text-navy-900 text-sm">News & Sentiment</h3>
          {!loading && (
            <span className="text-xs text-navy-400 bg-navy-200/50 px-2 py-0.5 rounded-full">
              {articles.length}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-navy-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="divide-y divide-navy-100">
          {loading ? (
            <div className="p-6 text-center">
              <svg className="animate-spin w-5 h-5 text-navy-400 mx-auto mb-2" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-navy-400">Loading news...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-navy-400">No news found for this coin.</p>
              <p className="text-xs text-navy-400 mt-1">
                Configure <code className="bg-navy-100 px-1 rounded">CRYPTO_NEWS_API_URL</code> for live news.
              </p>
            </div>
          ) : (
            articles.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 hover:bg-navy-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-navy-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
                    {article.title}
                  </h4>
                  {article.description && (
                    <p className="text-xs text-navy-500 mt-1 line-clamp-2">{article.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-navy-400">{article.source}</span>
                    <span className="text-navy-300">&middot;</span>
                    <span className="text-xs text-navy-400">{formatTime(article.publishedAt)}</span>
                    {article.sentiment && (
                      <>
                        <span className="text-navy-300">&middot;</span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${sentimentColor(article.sentiment)}`}>
                          {sentimentLabel(article.sentiment)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <svg className="w-4 h-4 text-navy-300 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
