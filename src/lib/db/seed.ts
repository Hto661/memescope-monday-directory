import { db, initDb } from './index';
import { coins } from './schema';
import { count } from 'drizzle-orm';

const SEED_COINS = [
  {
    id: 'seed_gake01', name: 'GAKE', ticker: '$GAKE', chain: 'solana',
    contractAddress: 'GAKExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    description: 'The cutest dog you\'ve ever seen. Born from Memescope Monday, GAKE went from 12k market cap to 26M in minutes. The OG Memescope Monday play.',
    category: 'Dog', marketCapAtSubmission: '$26M ATH', status: 'featured',
    featured: true, trending: true, submittedAt: '2025-03-24T10:00:00.000Z',
    weekLabel: 'March 24, 2025', slug: 'gake-gake-seed01', coinType: 'existing',
    paidExpedited: false, paidTrending: false,
  },
  {
    id: 'seed_moonsol', name: 'MoonDog', ticker: '$MOON', chain: 'solana',
    contractAddress: 'MOONxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    description: 'A moonshot meme coin found early on Memescope. Community-driven with strong diamond hands.',
    category: 'Dog', marketCapAtSubmission: '$500K', status: 'approved',
    featured: false, trending: true, submittedAt: '2025-03-24T10:30:00.000Z',
    weekLabel: 'March 24, 2025', slug: 'moondog-moon-seed02', coinType: 'existing',
    paidExpedited: false, paidTrending: false,
  },
  {
    id: 'seed_basefrog', name: 'BaseFrog', ticker: '$BFROG', chain: 'base',
    contractAddress: '0xBaseFrogxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    description: 'The first frog on Base chain to make it to Memescope Monday.',
    category: 'Meme', marketCapAtSubmission: '$120K', status: 'approved',
    featured: false, trending: false, submittedAt: '2025-03-24T11:00:00.000Z',
    weekLabel: 'March 24, 2025', slug: 'basefrog-bfrog-seed03', coinType: 'existing',
    paidExpedited: false, paidTrending: false,
  },
  {
    id: 'seed_bnbcat', name: 'BNB Cat', ticker: '$BCAT', chain: 'bnb',
    contractAddress: '0xBNBCatxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    description: 'The purrfect BNB Chain memecoin. Found on Memescope Monday.',
    category: 'Cat', marketCapAtSubmission: '$80K', status: 'approved',
    featured: false, trending: true, submittedAt: '2025-03-24T11:30:00.000Z',
    weekLabel: 'March 24, 2025', slug: 'bnb-cat-bcat-seed04', coinType: 'existing',
    paidExpedited: false, paidTrending: false,
  },
  {
    id: 'seed_aiagent', name: 'AI Agent', ticker: '$AGENT', chain: 'solana',
    contractAddress: 'AGENTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    description: 'An AI-themed memecoin riding the AI agent wave.',
    category: 'AI', marketCapAtSubmission: '$1.2M', status: 'approved',
    featured: true, trending: false, submittedAt: '2025-03-24T12:00:00.000Z',
    weekLabel: 'March 24, 2025', slug: 'ai-agent-agent-seed05', coinType: 'existing',
    paidExpedited: false, paidTrending: false,
  },
  {
    id: 'seed_culturecoin', name: 'Vibe Check', ticker: '$VIBE', chain: 'solana',
    contractAddress: 'VIBExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    description: 'Vibe coding meets vibe trading. This coin is all about the culture shift.',
    category: 'Culture', marketCapAtSubmission: '$350K', status: 'approved',
    featured: true, trending: true, submittedAt: '2025-03-24T12:30:00.000Z',
    weekLabel: 'March 24, 2025', slug: 'vibe-check-vibe-seed06', coinType: 'existing',
    paidExpedited: false, paidTrending: false,
  },
  {
    id: 'seed_upcoming1', name: 'LaunchPad Dog', ticker: '$LDOG', chain: 'solana',
    contractAddress: 'TBA',
    description: 'Upcoming dog memecoin launching on PumpFun this Monday.',
    category: 'Dog', status: 'approved',
    featured: false, trending: false, submittedAt: '2025-03-27T08:00:00.000Z',
    weekLabel: 'March 31, 2025', slug: 'launchpad-dog-ldog-seed07', coinType: 'upcoming',
    launchDate: '2025-03-31T10:00:00.000Z', paidExpedited: true, paidTrending: false,
  },
];

export async function seedDatabase() {
  await initDb();
  const result = await db.select({ value: count() }).from(coins);
  if (result[0] && result[0].value > 0) return;

  for (const coin of SEED_COINS) {
    await db.insert(coins).values(coin as any);
  }
  console.log(`Seeded ${SEED_COINS.length} coins`);
}
