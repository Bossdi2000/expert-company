// Centralized mock data for the prototype.
// Replace with real API calls when Lovable Cloud is wired up.

export type Plan = {
  id: string;
  name: string;
  tier: "Starter" | "Premium" | "Elite" | "Royal";
  min: number;
  max: number;
  dailyRoi: number; // %
  duration: number; // days
  perks: string[];
  accent: "silver" | "bronze" | "gold" | "platinum" | "emerald" | "ruby" | "sapphire" | "diamond";
};

export const PLANS: Plan[] = [
  {
    id: "plan1",
    name: "Starter",
    tier: "Starter",
    min: 100,
    max: 500,
    dailyRoi: 5,
    perks: ["Daily 5% ROI", "24/7 Support"],
    accent: "silver",
  },
  {
    id: "plan2",
    name: "Premium",
    tier: "Premium",
    min: 501,
    max: 1000,
    dailyRoi: 7,
    perks: ["Daily 7% ROI", "Priority Support"],
    accent: "ruby",
  },
  {
    id: "plan3",
    name: "Elite",
    tier: "Elite",
    min: 1001,
    max: 1500,
    dailyRoi: 10,
    perks: ["Daily 10% ROI", "Dedicated Manager"],
    accent: "emerald",
  },
  {
    id: "plan4",
    name: "Royal",
    tier: "Royal",
    min: 1501,
    max: 2000,
    dailyRoi: 12,
    perks: ["Daily 12% ROI", "VIP Access"],
    accent: "gold",
  },
];

export type MarketTicker = {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  kind: "crypto" | "forex" | "metal";
};

export const MARKETS: MarketTicker[] = [
  { symbol: "BTC", name: "Bitcoin", price: 96420.55, change24h: 2.41, kind: "crypto" },
  { symbol: "ETH", name: "Ethereum", price: 3284.17, change24h: 1.85, kind: "crypto" },
  { symbol: "BNB", name: "BNB", price: 712.04, change24h: -0.62, kind: "crypto" },
  { symbol: "TON", name: "Toncoin", price: 5.42, change24h: 3.74, kind: "crypto" },
  { symbol: "SOL", name: "Solana", price: 198.66, change24h: 4.12, kind: "crypto" },
  { symbol: "TRX", name: "Tron", price: 0.234, change24h: 0.91, kind: "crypto" },
  { symbol: "XAU", name: "Gold (oz)", price: 2685.4, change24h: 0.55, kind: "metal" },
  { symbol: "XAG", name: "Silver (oz)", price: 31.22, change24h: 1.18, kind: "metal" },
  { symbol: "EUR/USD", name: "Euro / Dollar", price: 1.0843, change24h: -0.12, kind: "forex" },
  { symbol: "GBP/USD", name: "Pound / Dollar", price: 1.2671, change24h: 0.21, kind: "forex" },
];

export const COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
];

export type LiveInvestment = {
  name: string;
  country: string;
  flag: string;
  amount: number;
  plan: string;
};

const FIRST_NAMES = [
  "Anabel", "Marcus", "Liam", "Sofia", "Yuki", "Carlos", "Amara",
  "Noah", "Aaliyah", "Hiroshi", "Elena", "Tariq", "Fatima", "Adrien",
  "Isabella", "Khalid", "Priya", "Sven", "Olivia", "Diego", "Zara",
  "Mateo", "Nadia", "Felix", "Lucia", "Kenji", "Aisha", "Viktor",
  "Maya", "Omar", "Elif", "Beatriz", "Ahmet", "Lena", "Rashid",
];

export function genLiveInvestment(): LiveInvestment {
  const c = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  const p = PLANS[Math.floor(Math.random() * PLANS.length)];
  const amount = Math.floor(p.min + Math.random() * (Math.min(p.max, p.min * 20) - p.min));
  return {
    name: FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)],
    country: c.name,
    flag: c.flag,
    amount,
    plan: p.name,
  };
}

export type Investment = {
  id: string;
  plan: string;
  amount: number;
  dailyRoi: number;
  startedAt: string;
  duration: number;
  status: "active" | "completed";
};

export type Transaction = {
  id: string;
  type: "deposit" | "withdrawal" | "roi" | "investment" | "reinvest";
  amount: number;
  status: "pending" | "completed" | "rejected";
  asset?: string;
  date: string;
};

export const MOCK_USER = {
  fullName: "Alexander Stone",
  email: "alex.stone@example.com",
  country: "United Kingdom",
  flag: "🇬🇧",
  joined: "2024-08-12",
  balance: 12480.55,
  totalInvested: 8200,
  totalEarnings: 4280.55,
  pendingWithdrawals: 0,
};

export const MOCK_INVESTMENTS: Investment[] = [
  { id: "inv-001", plan: "Emerald", amount: 5000, dailyRoi: 11, startedAt: "2026-04-01", duration: 60, status: "active" },
  { id: "inv-002", plan: "Ruby", amount: 1200, dailyRoi: 8, startedAt: "2026-04-10", duration: 45, status: "active" },
  { id: "inv-003", plan: "Bronze", amount: 200, dailyRoi: 5, startedAt: "2026-03-05", duration: 30, status: "completed" },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "tx-101", type: "deposit", amount: 5000, status: "completed", asset: "USDT", date: "2026-04-01" },
  { id: "tx-102", type: "investment", amount: 5000, status: "completed", date: "2026-04-01" },
  { id: "tx-103", type: "roi", amount: 550, status: "completed", date: "2026-04-02" },
  { id: "tx-104", type: "roi", amount: 550, status: "completed", date: "2026-04-03" },
  { id: "tx-105", type: "deposit", amount: 1200, status: "completed", asset: "BTC", date: "2026-04-10" },
  { id: "tx-106", type: "withdrawal", amount: 800, status: "pending", date: "2026-04-18" },
  { id: "tx-107", type: "reinvest", amount: 300, status: "completed", date: "2026-04-15" },
];

export type CryptoToken = {
  symbol: string;
  name: string;
  networks: string[];
};

export const DEPOSIT_TOKENS: CryptoToken[] = [
  { symbol: "BTC", name: "Bitcoin", networks: ["Bitcoin"] },
  { symbol: "ETH", name: "Ethereum", networks: ["ERC-20", "Arbitrum", "Base"] },
  { symbol: "USDT", name: "Tether", networks: ["TRC-20", "ERC-20", "BEP-20"] },
  { symbol: "BNB", name: "BNB", networks: ["BEP-20"] },
  { symbol: "TRX", name: "Tron", networks: ["TRC-20"] },
  { symbol: "TON", name: "Toncoin", networks: ["TON"] },
];

// Random wallet address generator (cosmetic)
export function genWalletAddress(token: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const len = token === "BTC" ? 34 : token === "TRX" ? 34 : 42;
  let out = token === "BTC" ? "bc1q" : token === "TRX" ? "T" : "0x";
  while (out.length < len) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// Admin mock data
export const ADMIN_USERS = [
  { id: "u-001", name: "Alexander Stone", email: "alex.stone@example.com", country: "🇬🇧 UK", balance: 12480.55, status: "active", joined: "2024-08-12" },
  { id: "u-002", name: "Sofia Martinez", email: "sofia.m@example.com", country: "🇪🇸 Spain", balance: 4250.0, status: "active", joined: "2025-01-20" },
  { id: "u-003", name: "Hiroshi Tanaka", email: "hiroshi.t@example.com", country: "🇯🇵 Japan", balance: 78900.4, status: "active", joined: "2024-11-04" },
  { id: "u-004", name: "Amara Okafor", email: "amara.o@example.com", country: "🇳🇬 Nigeria", balance: 980.25, status: "suspended", joined: "2025-03-15" },
  { id: "u-005", name: "Liam O'Connor", email: "liam.o@example.com", country: "🇮🇪 Ireland", balance: 22100.0, status: "active", joined: "2025-02-08" },
  { id: "u-006", name: "Yuki Sato", email: "yuki.s@example.com", country: "🇯🇵 Japan", balance: 5600.0, status: "active", joined: "2026-01-22" },
];

export const ADMIN_DEPOSITS = [
  { id: "dep-201", user: "Sofia Martinez", email: "sofia.m@example.com", amount: 1500, asset: "USDT (TRC-20)", wallet: "TQn9Y2khEsLJW1ChVWFMSMeRDow5oLp9XW", status: "pending", submitted: "2026-04-21 09:14" },
  { id: "dep-202", user: "Liam O'Connor", email: "liam.o@example.com", amount: 8000, asset: "BTC", wallet: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq", status: "pending", submitted: "2026-04-21 08:42" },
  { id: "dep-203", user: "Hiroshi Tanaka", email: "hiroshi.t@example.com", amount: 25000, asset: "ETH (ERC-20)", wallet: "0x4e83362442b8d1bec281594cea3050c8eb01311c", status: "pending", submitted: "2026-04-21 07:55" },
  { id: "dep-204", user: "Yuki Sato", email: "yuki.s@example.com", amount: 600, asset: "BNB (BEP-20)", wallet: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", status: "received", submitted: "2026-04-20 22:11" },
  { id: "dep-205", user: "Amara Okafor", email: "amara.o@example.com", amount: 200, asset: "TRX (TRC-20)", wallet: "TYukWhBL5h83q2D3NZc5qRgkkx3xiC8yxh", status: "rejected", submitted: "2026-04-20 18:30" },
];

export const ADMIN_WALLETS = [
  { id: "w-1", asset: "BTC", network: "Bitcoin", address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq", assignedTo: null },
  { id: "w-2", asset: "USDT", network: "TRC-20", address: "TQn9Y2khEsLJW1ChVWFMSMeRDow5oLp9XW", assignedTo: "sofia.m@example.com" },
  { id: "w-3", asset: "ETH", network: "ERC-20", address: "0x4e83362442b8d1bec281594cea3050c8eb01311c", assignedTo: null },
  { id: "w-4", asset: "BNB", network: "BEP-20", address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", assignedTo: null },
  { id: "w-5", asset: "TRX", network: "TRC-20", address: "TYukWhBL5h83q2D3NZc5qRgkkx3xiC8yxh", assignedTo: null },
  { id: "w-6", asset: "TON", network: "TON", address: "UQDi3uJzJpQ9yk4RxPUpUwq8mRr5rEzKqSvFYJ7n8jH3kLpQ", assignedTo: null },
];

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
}
