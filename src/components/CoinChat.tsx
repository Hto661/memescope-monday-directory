'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { generateAnonName, cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/types';

interface CoinChatProps {
  coinSlug: string;
}

export function CoinChat({ coinSlug }: CoinChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [author, setAuthor] = useState('');
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTimestampRef = useRef<string | null>(null);

  // Generate persistent anonymous name
  useEffect(() => {
    const stored = localStorage.getItem(`chat-name-${coinSlug}`);
    if (stored) {
      setAuthor(stored);
    } else {
      const name = generateAnonName();
      localStorage.setItem(`chat-name-${coinSlug}`, name);
      setAuthor(name);
    }
  }, [coinSlug]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const params = lastTimestampRef.current ? `?after=${encodeURIComponent(lastTimestampRef.current)}` : '';
      const res = await fetch(`/api/coins/${coinSlug}/chat${params}`);
      if (!res.ok) return;
      const data = await res.json();

      if (lastTimestampRef.current && data.messages.length > 0) {
        setMessages((prev) => [...prev, ...data.messages]);
      } else if (!lastTimestampRef.current) {
        setMessages(data.messages);
      }

      if (data.messages.length > 0) {
        lastTimestampRef.current = data.messages[data.messages.length - 1].timestamp;
      }
    } catch {
      // silently fail
    }
  }, [coinSlug]);

  // Initial load + polling
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    const text = input.trim();
    setInput('');

    try {
      const res = await fetch(`/api/coins/${coinSlug}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, text }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        lastTimestampRef.current = data.message.timestamp;
      }
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-navy-100 bg-navy-50 hover:bg-navy-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">💬</span>
          <h3 className="font-bold text-navy-900 text-sm">Trollbox</h3>
          <span className="text-xs text-navy-400 bg-navy-200/50 px-2 py-0.5 rounded-full">
            {messages.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && !expanded && (
            <span className="text-xs text-navy-400 truncate max-w-[200px]">
              {messages[messages.length - 1]?.text}
            </span>
          )}
          <svg
            className={cn('w-4 h-4 text-navy-400 transition-transform', expanded && 'rotate-180')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <>
          {/* Messages */}
          <div className="h-64 overflow-y-auto px-4 py-3 space-y-2 bg-white">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-navy-400">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.author === author;
                return (
                  <div key={msg.id} className={cn('flex gap-2', isMe && 'flex-row-reverse')}>
                    <div
                      className={cn(
                        'max-w-[75%] rounded-xl px-3 py-2',
                        isMe ? 'bg-brand-500 text-white' : 'bg-navy-100 text-navy-800'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('text-xs font-semibold', isMe ? 'text-brand-100' : 'text-navy-500')}>
                          {msg.author}
                        </span>
                        <span className={cn('text-xs', isMe ? 'text-brand-200' : 'text-navy-400')}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm break-words">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Identity bar */}
          <div className="px-4 py-2 border-t border-navy-100 bg-navy-50/50">
            <p className="text-xs text-navy-400">
              Chatting as <span className="font-semibold text-navy-600">{author}</span>
            </p>
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-navy-100">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Say something degen..."
              maxLength={280}
              className="flex-1 px-3 py-2 rounded-lg border border-navy-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="px-4 py-2 rounded-lg bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}
