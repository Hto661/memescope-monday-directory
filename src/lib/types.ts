export type Chain = 'solana' | 'base' | 'bnb';

export type SubmissionStatus = 'pending' | 'approved' | 'featured' | 'rejected';

export type CoinType = 'existing' | 'upcoming';

export interface Coin {
  id: string;
  name: string;
  ticker: string;
  chain: Chain;
  contractAddress: string;
  description: string;
  imageUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  telegramUrl?: string;
  pumpFunUrl?: string;
  dexScreenerUrl?: string;
  category: string;
  marketCapAtSubmission?: string;
  submitterEmail?: string;
  status: SubmissionStatus;
  featured: boolean;
  trending: boolean;
  submittedAt: string;
  weekLabel: string;
  slug: string;
  // New fields
  votes: number;
  coinType: CoinType;
  launchDate?: string; // ISO string for upcoming launches
  paidExpedited: boolean;
  paidTrending: boolean;
}

export interface ChatMessage {
  id: string;
  coinSlug: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface SubmitFormData {
  name: string;
  ticker: string;
  chain: Chain;
  contractAddress: string;
  description: string;
  imageUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  telegramUrl?: string;
  pumpFunUrl?: string;
  dexScreenerUrl?: string;
  category: string;
  submitterEmail: string;
  coinType: CoinType;
  launchDate?: string;
}

export const CHAINS: { id: Chain; name: string; color: string; bgColor: string; icon: string; dexPrefix: string }[] = [
  { id: 'solana', name: 'Solana', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: '◎', dexPrefix: 'solana' },
  { id: 'base', name: 'Base', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: '🔵', dexPrefix: 'base' },
  { id: 'bnb', name: 'BNB Chain', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: '🟡', dexPrefix: 'bsc' },
];

export const CATEGORIES = [
  'Meme',
  'Dog',
  'Cat',
  'AI',
  'Gaming',
  'DeFi',
  'Culture',
  'Celebrity',
  'Political',
  'Other',
];

export const PAID_FEATURES = {
  expedited: { price: 19, label: 'Expedited Review', description: 'Skip the queue. Reviewed within 1 hour.' },
  trending: { price: 49, label: 'Trending Placement', description: '24h featured in the Trending section.' },
  bundle: { price: 59, label: 'Bundle (Both)', description: 'Expedited review + 24h trending placement.' },
} as const;

export function getChainInfo(chain: Chain) {
  return CHAINS.find((c) => c.id === chain) ?? CHAINS[0];
}

export function getDexScreenerEmbedUrl(chain: Chain, contractAddress: string): string {
  const info = getChainInfo(chain);
  return `https://dexscreener.com/${info.dexPrefix}/${contractAddress}?embed=1&theme=light&info=0`;
}
