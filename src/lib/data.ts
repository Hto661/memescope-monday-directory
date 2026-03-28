import { db, initDb } from './db';
import { seedDatabase } from './db/seed';
import { coins, votes, watchlist, chatMessages, users } from './db/schema';
import { eq, and, or, like, desc, asc, sql, count } from 'drizzle-orm';
import type { Coin, SubmitFormData, ChatMessage } from './types';
import type { CoinRow } from './db/schema';
import { slugify } from './utils';

// Ensure DB is ready
let ready = false;
async function ensureReady() {
  if (ready) return;
  await initDb();
  await seedDatabase();
  ready = true;
}

// ── Helpers ──

function rowToCoin(row: CoinRow, voteCount: number = 0): Coin {
  return {
    id: row.id,
    name: row.name,
    ticker: row.ticker,
    chain: row.chain as Coin['chain'],
    contractAddress: row.contractAddress,
    description: row.description,
    imageUrl: row.imageUrl ?? undefined,
    websiteUrl: row.websiteUrl ?? undefined,
    twitterUrl: row.twitterUrl ?? undefined,
    telegramUrl: row.telegramUrl ?? undefined,
    pumpFunUrl: row.pumpFunUrl ?? undefined,
    dexScreenerUrl: row.dexScreenerUrl ?? undefined,
    category: row.category,
    marketCapAtSubmission: row.marketCapAtSubmission ?? undefined,
    submitterEmail: row.submitterEmail ?? undefined,
    status: row.status as Coin['status'],
    featured: row.featured,
    trending: row.trending,
    submittedAt: row.submittedAt,
    weekLabel: row.weekLabel,
    slug: row.slug,
    votes: voteCount,
    coinType: (row.coinType as Coin['coinType']) ?? 'existing',
    launchDate: row.launchDate ?? undefined,
    paidExpedited: row.paidExpedited,
    paidTrending: row.paidTrending,
  };
}

function generateId(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < array.length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

// ── Coin Queries ──

async function coinsWithVotes() {
  await ensureReady();
  return db.select({
    coin: coins,
    voteCount: sql<number>`(SELECT COUNT(*) FROM votes WHERE votes.coin_id = ${coins.id})`.as('vote_count'),
  }).from(coins);
}

export async function getCoins(): Promise<Coin[]> {
  const rows = await coinsWithVotes();
  return rows.map((r) => rowToCoin(r.coin, r.voteCount));
}

export async function getCoinBySlug(slug: string): Promise<Coin | undefined> {
  await ensureReady();
  const rows = await db.select({
    coin: coins,
    voteCount: sql<number>`(SELECT COUNT(*) FROM votes WHERE votes.coin_id = ${coins.id})`.as('vote_count'),
  }).from(coins).where(eq(coins.slug, slug));

  if (rows.length === 0) return undefined;
  return rowToCoin(rows[0].coin, rows[0].voteCount);
}

export async function getCoinById(id: string): Promise<Coin | undefined> {
  await ensureReady();
  const rows = await db.select({
    coin: coins,
    voteCount: sql<number>`(SELECT COUNT(*) FROM votes WHERE votes.coin_id = ${coins.id})`.as('vote_count'),
  }).from(coins).where(eq(coins.id, id));

  if (rows.length === 0) return undefined;
  return rowToCoin(rows[0].coin, rows[0].voteCount);
}

export async function getApprovedCoins(): Promise<Coin[]> {
  await ensureReady();
  const rows = await db.select({
    coin: coins,
    voteCount: sql<number>`(SELECT COUNT(*) FROM votes WHERE votes.coin_id = ${coins.id})`.as('vote_count'),
  }).from(coins)
    .where(or(eq(coins.status, 'approved'), eq(coins.status, 'featured')));

  return rows.map((r) => rowToCoin(r.coin, r.voteCount));
}

export async function getFeaturedCoins(): Promise<Coin[]> {
  await ensureReady();
  const rows = await db.select({
    coin: coins,
    voteCount: sql<number>`(SELECT COUNT(*) FROM votes WHERE votes.coin_id = ${coins.id})`.as('vote_count'),
  }).from(coins)
    .where(and(
      eq(coins.featured, true),
      or(eq(coins.status, 'approved'), eq(coins.status, 'featured'))
    ));

  return rows.map((r) => rowToCoin(r.coin, r.voteCount));
}

export async function getTrendingCoins(): Promise<Coin[]> {
  await ensureReady();
  const rows = await db.select({
    coin: coins,
    voteCount: sql<number>`(SELECT COUNT(*) FROM votes WHERE votes.coin_id = ${coins.id})`.as('vote_count'),
  }).from(coins)
    .where(and(
      or(eq(coins.trending, true), eq(coins.paidTrending, true)),
      or(eq(coins.status, 'approved'), eq(coins.status, 'featured'))
    ))
    .orderBy(desc(sql`(SELECT COUNT(*) FROM votes WHERE votes.coin_id = coins.id)`));

  return rows.map((r) => rowToCoin(r.coin, r.voteCount));
}

export async function searchCoins(query: string): Promise<Coin[]> {
  await ensureReady();
  const q = `%${query}%`;
  const rows = await db.select({
    coin: coins,
    voteCount: sql<number>`(SELECT COUNT(*) FROM votes WHERE votes.coin_id = ${coins.id})`.as('vote_count'),
  }).from(coins)
    .where(and(
      or(eq(coins.status, 'approved'), eq(coins.status, 'featured')),
      or(
        like(coins.name, q),
        like(coins.ticker, q),
        like(coins.contractAddress, q),
        like(coins.description, q)
      )
    ));

  return rows.map((r) => rowToCoin(r.coin, r.voteCount));
}

export async function addCoin(data: SubmitFormData, userId?: string): Promise<Coin> {
  await ensureReady();
  const id = generateId(12);
  const slug = slugify(`${data.name}-${data.ticker}-${id.slice(0, 6)}`);

  await db.insert(coins).values({
    id,
    name: data.name,
    ticker: data.ticker,
    chain: data.chain,
    contractAddress: data.contractAddress,
    description: data.description,
    imageUrl: data.imageUrl,
    websiteUrl: data.websiteUrl,
    twitterUrl: data.twitterUrl,
    telegramUrl: data.telegramUrl,
    pumpFunUrl: data.pumpFunUrl,
    dexScreenerUrl: data.dexScreenerUrl,
    category: data.category,
    submitterEmail: data.submitterEmail,
    submitterUserId: userId,
    status: 'pending',
    featured: false,
    trending: false,
    coinType: data.coinType ?? 'existing',
    launchDate: data.launchDate,
    paidExpedited: false,
    paidTrending: false,
    slug,
    weekLabel: getNextMondayLabel(),
    submittedAt: new Date().toISOString(),
  });

  return (await getCoinById(id))!;
}

// ── Voting ──

export async function upvoteCoin(coinSlug: string, userId: string): Promise<{ votes: number; alreadyVoted: boolean }> {
  await ensureReady();
  const coin = await getCoinBySlug(coinSlug);
  if (!coin) throw new Error('Coin not found');

  const existing = await db.select().from(votes)
    .where(and(eq(votes.userId, userId), eq(votes.coinId, coin.id)));

  if (existing.length > 0) {
    return { votes: coin.votes, alreadyVoted: true };
  }

  await db.insert(votes).values({
    id: generateId(12),
    userId,
    coinId: coin.id,
    createdAt: new Date().toISOString(),
  });

  const updated = await getCoinBySlug(coinSlug);
  return { votes: updated?.votes ?? coin.votes + 1, alreadyVoted: false };
}

export async function hasUserVoted(coinId: string, userId: string): Promise<boolean> {
  await ensureReady();
  const existing = await db.select().from(votes)
    .where(and(eq(votes.userId, userId), eq(votes.coinId, coinId)));
  return existing.length > 0;
}

export async function getUserVotedCoins(userId: string): Promise<string[]> {
  await ensureReady();
  const rows = await db.select({ coinId: votes.coinId }).from(votes)
    .where(eq(votes.userId, userId));
  return rows.map((r) => r.coinId);
}

// ── Watchlist ──

export async function addToWatchlist(userId: string, coinId: string): Promise<void> {
  await ensureReady();
  const existing = await db.select().from(watchlist)
    .where(and(eq(watchlist.userId, userId), eq(watchlist.coinId, coinId)));

  if (existing.length > 0) return;

  await db.insert(watchlist).values({
    id: generateId(12),
    userId,
    coinId,
    createdAt: new Date().toISOString(),
  });
}

export async function removeFromWatchlist(userId: string, coinId: string): Promise<void> {
  await ensureReady();
  await db.delete(watchlist)
    .where(and(eq(watchlist.userId, userId), eq(watchlist.coinId, coinId)));
}

export async function getUserWatchlist(userId: string): Promise<Coin[]> {
  await ensureReady();
  const items = await db.select({ coinId: watchlist.coinId }).from(watchlist)
    .where(eq(watchlist.userId, userId))
    .orderBy(desc(watchlist.createdAt));

  const coinIds = items.map((i) => i.coinId);
  if (coinIds.length === 0) return [];

  const allCoins = await getCoins();
  return allCoins.filter((c) => coinIds.includes(c.id));
}

export async function isInWatchlist(userId: string, coinId: string): Promise<boolean> {
  await ensureReady();
  const existing = await db.select().from(watchlist)
    .where(and(eq(watchlist.userId, userId), eq(watchlist.coinId, coinId)));
  return existing.length > 0;
}

// ── Paid features ──

export async function markPaidExpedited(slug: string): Promise<void> {
  await ensureReady();
  await db.update(coins)
    .set({ paidExpedited: true, status: 'approved' })
    .where(eq(coins.slug, slug));
}

export async function markPaidTrending(slug: string): Promise<void> {
  await ensureReady();
  await db.update(coins)
    .set({ paidTrending: true, trending: true })
    .where(eq(coins.slug, slug));
}

// ── Chat ──

export async function getChatMessages(coinSlug: string, after?: string): Promise<ChatMessage[]> {
  await ensureReady();
  const coin = await getCoinBySlug(coinSlug);
  if (!coin) return [];

  const rows = await db.select().from(chatMessages)
    .where(eq(chatMessages.coinId, coin.id))
    .orderBy(asc(chatMessages.timestamp));

  let messages = rows.map((r) => ({
    id: r.id,
    coinSlug,
    author: r.author,
    text: r.text,
    timestamp: r.timestamp,
  }));

  if (after) {
    const afterTime = new Date(after).getTime();
    messages = messages.filter((m) => new Date(m.timestamp).getTime() > afterTime);
  }

  return messages;
}

export async function addChatMessage(coinSlug: string, author: string, text: string, userId?: string): Promise<ChatMessage> {
  await ensureReady();
  const coin = await getCoinBySlug(coinSlug);
  if (!coin) throw new Error('Coin not found');

  const id = generateId(10);

  await db.insert(chatMessages).values({
    id,
    coinId: coin.id,
    userId: userId ?? null,
    author,
    text: text.slice(0, 280),
    timestamp: new Date().toISOString(),
  });

  return { id, coinSlug, author, text: text.slice(0, 280), timestamp: new Date().toISOString() };
}

// ── Stats ──

export async function getStats() {
  await ensureReady();
  const coinCount = await db.select({ value: count() }).from(coins)
    .where(or(eq(coins.status, 'approved'), eq(coins.status, 'featured')));
  const voteCount = await db.select({ value: count() }).from(votes);
  const userCount = await db.select({ value: count() }).from(users);

  return {
    totalCoins: coinCount[0]?.value ?? 0,
    totalVotes: voteCount[0]?.value ?? 0,
    totalUsers: userCount[0]?.value ?? 0,
  };
}

// ── Helpers ──

function getNextMondayLabel(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  const nextMonday = new Date(now);
  nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday);
  return nextMonday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
