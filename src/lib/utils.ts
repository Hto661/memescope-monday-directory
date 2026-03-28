export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function truncateAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function getNextMondayUTC(): Date {
  const now = new Date();
  const utcDay = now.getUTCDay();
  const daysUntilMonday = utcDay === 0 ? 1 : utcDay === 1 ? (now.getUTCHours() >= 10 ? 7 : 0) : 8 - utcDay;
  const nextMonday = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + daysUntilMonday,
    10, 0, 0, 0
  ));
  return nextMonday;
}

export function getCountdown(target: Date): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const diff = Math.max(0, target.getTime() - now.getTime());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function getLaunchCountdown(launchDate: string): { days: number; hours: number; minutes: number; seconds: number; passed: boolean } {
  const target = new Date(launchDate);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    passed: false,
  };
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

const ANON_ADJECTIVES = ['Based', 'Diamond', 'Moon', 'Degen', 'Alpha', 'Sigma', 'Chad', 'Giga', 'Turbo', 'Ultra', 'Mega', 'Super', 'Hyper', 'Cosmic', 'Astro'];
const ANON_NOUNS = ['Ape', 'Bull', 'Frog', 'Whale', 'Shark', 'Pepe', 'Wojak', 'Doge', 'Cat', 'Bear', 'Fox', 'Hawk', 'Wolf', 'Lion', 'Tiger'];

export function generateAnonName(): string {
  const adj = ANON_ADJECTIVES[Math.floor(Math.random() * ANON_ADJECTIVES.length)];
  const noun = ANON_NOUNS[Math.floor(Math.random() * ANON_NOUNS.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
}
