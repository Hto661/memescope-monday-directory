import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

// ── Users ──
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').notNull(),
});

// ── Sessions ──
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
});

// ── Coins ──
export const coins = sqliteTable('coins', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  ticker: text('ticker').notNull(),
  chain: text('chain').notNull(), // 'solana' | 'base' | 'bnb'
  contractAddress: text('contract_address').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url'),
  websiteUrl: text('website_url'),
  twitterUrl: text('twitter_url'),
  telegramUrl: text('telegram_url'),
  pumpFunUrl: text('pump_fun_url'),
  dexScreenerUrl: text('dex_screener_url'),
  category: text('category').notNull(),
  marketCapAtSubmission: text('market_cap_at_submission'),
  submitterEmail: text('submitter_email'),
  submitterUserId: text('submitter_user_id').references(() => users.id),
  status: text('status').notNull().default('pending'), // pending | approved | featured | rejected
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  trending: integer('trending', { mode: 'boolean' }).notNull().default(false),
  coinType: text('coin_type').notNull().default('existing'), // existing | upcoming
  launchDate: text('launch_date'),
  paidExpedited: integer('paid_expedited', { mode: 'boolean' }).notNull().default(false),
  paidTrending: integer('paid_trending', { mode: 'boolean' }).notNull().default(false),
  slug: text('slug').notNull().unique(),
  weekLabel: text('week_label').notNull(),
  submittedAt: text('submitted_at').notNull(),
});

// ── Votes ──
export const votes = sqliteTable('votes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  coinId: text('coin_id').notNull().references(() => coins.id),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  userCoinUnique: uniqueIndex('votes_user_coin_idx').on(table.userId, table.coinId),
}));

// ── Watchlist ──
export const watchlist = sqliteTable('watchlist', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  coinId: text('coin_id').notNull().references(() => coins.id),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  userCoinUnique: uniqueIndex('watchlist_user_coin_idx').on(table.userId, table.coinId),
}));

// ── Chat Messages ──
export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  coinId: text('coin_id').notNull().references(() => coins.id),
  userId: text('user_id').references(() => users.id),
  author: text('author').notNull(),
  text: text('text').notNull(),
  timestamp: text('timestamp').notNull(),
});

// ── Types ──
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type CoinRow = typeof coins.$inferSelect;
export type NewCoin = typeof coins.$inferInsert;
export type Vote = typeof votes.$inferSelect;
export type WatchlistItem = typeof watchlist.$inferSelect;
export type ChatMessageRow = typeof chatMessages.$inferSelect;
