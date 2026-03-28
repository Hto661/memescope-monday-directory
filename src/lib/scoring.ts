import type { Coin } from './types';
import type { DexToken } from './dexscreener';

export interface SafetyScore {
  overall: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: SafetyFactor[];
}

export interface SafetyFactor {
  name: string;
  score: number; // 0-100
  weight: number;
  detail: string;
  status: 'good' | 'warning' | 'danger';
}

export interface SocialBuzzScore {
  level: number; // 0-100
  label: 'Dead' | 'Low' | 'Moderate' | 'Hot' | 'Viral';
  signals: string[];
}

/**
 * Calculate safety score based on on-chain data + listing metadata.
 * Inspired by crypto-vision anomaly detection patterns.
 */
export function calculateSafetyScore(coin: Coin, dexData: DexToken | null): SafetyScore {
  const factors: SafetyFactor[] = [];

  // 1. Liquidity check (25% weight)
  const liquidityUsd = dexData?.liquidity?.usd ?? 0;
  let liquidityScore = 0;
  let liquidityDetail = '';
  if (liquidityUsd > 100_000) {
    liquidityScore = 90;
    liquidityDetail = `Strong liquidity ($${(liquidityUsd / 1000).toFixed(0)}K)`;
  } else if (liquidityUsd > 20_000) {
    liquidityScore = 65;
    liquidityDetail = `Moderate liquidity ($${(liquidityUsd / 1000).toFixed(0)}K)`;
  } else if (liquidityUsd > 5_000) {
    liquidityScore = 40;
    liquidityDetail = `Low liquidity ($${(liquidityUsd / 1000).toFixed(0)}K)`;
  } else if (dexData) {
    liquidityScore = 15;
    liquidityDetail = `Very low liquidity ($${liquidityUsd.toFixed(0)})`;
  } else {
    liquidityScore = 0;
    liquidityDetail = 'No on-chain data available';
  }
  factors.push({
    name: 'Liquidity',
    score: liquidityScore,
    weight: 25,
    detail: liquidityDetail,
    status: liquidityScore >= 60 ? 'good' : liquidityScore >= 30 ? 'warning' : 'danger',
  });

  // 2. Trading activity (20% weight)
  const txns24h = dexData ? (dexData.txns?.h24?.buys ?? 0) + (dexData.txns?.h24?.sells ?? 0) : 0;
  let activityScore = 0;
  let activityDetail = '';
  if (txns24h > 500) {
    activityScore = 90;
    activityDetail = `High activity (${txns24h} txns/24h)`;
  } else if (txns24h > 100) {
    activityScore = 65;
    activityDetail = `Moderate activity (${txns24h} txns/24h)`;
  } else if (txns24h > 20) {
    activityScore = 40;
    activityDetail = `Low activity (${txns24h} txns/24h)`;
  } else if (dexData) {
    activityScore = 15;
    activityDetail = `Very low activity (${txns24h} txns/24h)`;
  } else {
    activityScore = 0;
    activityDetail = 'No trading data';
  }
  factors.push({
    name: 'Trading Activity',
    score: activityScore,
    weight: 20,
    detail: activityDetail,
    status: activityScore >= 60 ? 'good' : activityScore >= 30 ? 'warning' : 'danger',
  });

  // 3. Buy/Sell ratio (15% weight) — lopsided ratios are suspicious
  let ratioScore = 50;
  let ratioDetail = 'No data';
  if (dexData && txns24h > 10) {
    const buys = dexData.txns?.h24?.buys ?? 0;
    const sells = dexData.txns?.h24?.sells ?? 0;
    const ratio = buys / Math.max(sells, 1);
    if (ratio >= 0.5 && ratio <= 2.0) {
      ratioScore = 85;
      ratioDetail = `Healthy ratio (${buys}B / ${sells}S)`;
    } else if (ratio >= 0.25 && ratio <= 4.0) {
      ratioScore = 55;
      ratioDetail = `Slightly imbalanced (${buys}B / ${sells}S)`;
    } else {
      ratioScore = 20;
      ratioDetail = `Heavily imbalanced (${buys}B / ${sells}S)`;
    }
  }
  factors.push({
    name: 'Buy/Sell Ratio',
    score: ratioScore,
    weight: 15,
    detail: ratioDetail,
    status: ratioScore >= 60 ? 'good' : ratioScore >= 30 ? 'warning' : 'danger',
  });

  // 4. Social presence (20% weight)
  let socialScore = 0;
  const socialLinks: string[] = [];
  if (coin.websiteUrl) { socialScore += 20; socialLinks.push('Website'); }
  if (coin.twitterUrl) { socialScore += 30; socialLinks.push('Twitter'); }
  if (coin.telegramUrl) { socialScore += 20; socialLinks.push('Telegram'); }
  if (coin.dexScreenerUrl || dexData) { socialScore += 15; socialLinks.push('DexScreener'); }
  if (coin.pumpFunUrl) { socialScore += 15; socialLinks.push('PumpFun'); }
  socialScore = Math.min(socialScore, 100);
  factors.push({
    name: 'Social Presence',
    score: socialScore,
    weight: 20,
    detail: socialLinks.length > 0 ? `Has: ${socialLinks.join(', ')}` : 'No social links provided',
    status: socialScore >= 60 ? 'good' : socialScore >= 30 ? 'warning' : 'danger',
  });

  // 5. Pair age (10% weight)
  let ageScore = 50;
  let ageDetail = 'Unknown age';
  if (dexData?.pairCreatedAt) {
    const ageHours = (Date.now() - dexData.pairCreatedAt) / (1000 * 60 * 60);
    if (ageHours > 168) { // > 1 week
      ageScore = 85;
      ageDetail = `${Math.floor(ageHours / 24)} days old`;
    } else if (ageHours > 24) {
      ageScore = 60;
      ageDetail = `${Math.floor(ageHours / 24)} days old`;
    } else if (ageHours > 2) {
      ageScore = 35;
      ageDetail = `${Math.floor(ageHours)} hours old`;
    } else {
      ageScore = 15;
      ageDetail = `Very new (${Math.floor(ageHours * 60)} min old)`;
    }
  }
  factors.push({
    name: 'Pair Age',
    score: ageScore,
    weight: 10,
    detail: ageDetail,
    status: ageScore >= 60 ? 'good' : ageScore >= 30 ? 'warning' : 'danger',
  });

  // 6. Community validation (10% weight)
  const voteScore = Math.min(100, (coin.votes ?? 0) * 2);
  factors.push({
    name: 'Community Votes',
    score: voteScore,
    weight: 10,
    detail: `${coin.votes ?? 0} upvotes`,
    status: voteScore >= 60 ? 'good' : voteScore >= 20 ? 'warning' : 'danger',
  });

  // Calculate weighted overall
  const overall = Math.round(
    factors.reduce((sum, f) => sum + (f.score * f.weight) / 100, 0)
  );

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (overall >= 80) grade = 'A';
  else if (overall >= 65) grade = 'B';
  else if (overall >= 45) grade = 'C';
  else if (overall >= 25) grade = 'D';
  else grade = 'F';

  return { overall, grade, factors };
}

/**
 * Calculate social buzz score based on available signals.
 * Inspired by analyze-memecoin-socials sentiment correlation.
 */
export function calculateSocialBuzz(coin: Coin, dexData: DexToken | null): SocialBuzzScore {
  const signals: string[] = [];
  let points = 0;

  // Upvotes signal
  const votes = coin.votes ?? 0;
  if (votes > 100) { points += 30; signals.push(`${votes} community upvotes`); }
  else if (votes > 30) { points += 15; signals.push(`${votes} upvotes and growing`); }
  else if (votes > 5) { points += 5; signals.push(`${votes} upvotes`); }

  // Trading volume signal
  const vol24h = dexData?.volume?.h24 ?? 0;
  if (vol24h > 1_000_000) { points += 25; signals.push(`$${(vol24h / 1_000_000).toFixed(1)}M 24h volume`); }
  else if (vol24h > 100_000) { points += 15; signals.push(`$${(vol24h / 1_000).toFixed(0)}K 24h volume`); }
  else if (vol24h > 10_000) { points += 8; signals.push(`$${(vol24h / 1_000).toFixed(0)}K 24h volume`); }

  // Price momentum
  const priceChange = dexData?.priceChange?.h24 ?? 0;
  if (priceChange > 100) { points += 20; signals.push(`+${priceChange.toFixed(0)}% in 24h`); }
  else if (priceChange > 20) { points += 10; signals.push(`+${priceChange.toFixed(0)}% in 24h`); }
  else if (priceChange < -50) { signals.push(`${priceChange.toFixed(0)}% in 24h`); }

  // Transaction count momentum
  const txns = dexData ? (dexData.txns?.h24?.buys ?? 0) + (dexData.txns?.h24?.sells ?? 0) : 0;
  if (txns > 1000) { points += 15; signals.push(`${txns} transactions today`); }
  else if (txns > 200) { points += 8; signals.push(`${txns} transactions today`); }

  // Social links present
  const linkCount = [coin.twitterUrl, coin.telegramUrl, coin.websiteUrl].filter(Boolean).length;
  if (linkCount >= 3) { points += 10; signals.push('Active social presence'); }
  else if (linkCount >= 1) { points += 5; }

  // Featured/trending flags
  if (coin.trending || coin.paidTrending) { points += 10; signals.push('Trending on Memescope Monday'); }
  if (coin.featured) { points += 5; signals.push('Featured listing'); }

  const level = Math.min(100, points);

  let label: 'Dead' | 'Low' | 'Moderate' | 'Hot' | 'Viral';
  if (level >= 80) label = 'Viral';
  else if (level >= 55) label = 'Hot';
  else if (level >= 30) label = 'Moderate';
  else if (level >= 10) label = 'Low';
  else label = 'Dead';

  return { level, label, signals };
}
