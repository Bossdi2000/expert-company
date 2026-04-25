import { PLANS } from "./mock-data";

export type Inv = {
  id: string;
  amount: number;
  daily_roi_pct: number;
  started_at: string;
  status: "pending" | "active" | "capital_withdrawal_requested" | "completed";
  plans: { name: string } | null;
  coin?: string;
  network?: string;
  capital_unlocks_at?: string;
};

// Referral bonus is immediately available
export function getReferralBonus(): number {
  return parseFloat(localStorage.getItem("mock_referral_bonus") || "0");
}
export function addReferralBonus(amount: number) {
  const current = getReferralBonus();
  localStorage.setItem("mock_referral_bonus", (current + amount).toString());
}
export function withdrawReferralBonus(amount: number) {
  const current = getReferralBonus();
  if (current < amount) throw new Error("Insufficient referral bonus");
  localStorage.setItem("mock_referral_bonus", (current - amount).toString());
}

// Profit tracking
export function getProfitWithdrawn(): number {
  return parseFloat(localStorage.getItem("mock_profit_withdrawn") || "0");
}
export function addProfitWithdrawn(amount: number) {
  const current = getProfitWithdrawn();
  localStorage.setItem("mock_profit_withdrawn", (current + amount).toString());
}

export const mockService = {
  getInvestments: (): Inv[] => {
    const data = localStorage.getItem("mock_investments");
    if (!data) return [];
    return JSON.parse(data);
  },

  updateInvestment: (inv: Inv) => {
    const invs = mockService.getInvestments();
    const idx = invs.findIndex(i => i.id === inv.id);
    if (idx !== -1) {
      invs[idx] = inv;
      localStorage.setItem("mock_investments", JSON.stringify(invs));
    }
  },

  createInvestment: async (planId: string, amount: number, coin: string, network: string) => {
    await new Promise((res) => setTimeout(res, 800));

    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) throw new Error("Plan not found");
    if (amount < plan.min || amount > plan.max) throw new Error("Amount out of range");

    const invs = mockService.getInvestments();
    const newInv: Inv = {
      id: "inv-" + Date.now(),
      amount,
      daily_roi_pct: plan.dailyRoi,
      started_at: new Date().toISOString(),
      status: "pending", // Now starts as pending
      plans: { name: plan.name },
      coin,
      network
    };
    invs.push(newInv);
    localStorage.setItem("mock_investments", JSON.stringify(invs));

    if (invs.length === 1) {
      addReferralBonus(amount * 0.05); // Give 5% referral bonus on first investment
    }

    return { data: newInv, error: null };
  },

  // Simulates admin approving a pending investment
  approveInvestment: (id: string) => {
    const invs = mockService.getInvestments();
    const inv = invs.find(i => i.id === id);
    if (inv && inv.status === "pending") {
      inv.status = "active";
      inv.started_at = new Date().toISOString(); // Start clock now
      localStorage.setItem("mock_investments", JSON.stringify(invs));
    }
  },

  requestCapitalWithdrawal: async (amount: number, token: string, network: string, address: string) => {
    await new Promise((res) => setTimeout(res, 800));
    // Simulate generic capital withdrawal request (takes 30 days to process)
    return { error: null };
  },

  updateProfile: async (updates: { full_name?: string; username?: string; phone?: string; country?: string }) => {
    await new Promise((res) => setTimeout(res, 800));
    if (updates.full_name) localStorage.setItem("mock_name", updates.full_name);
    if (updates.username) localStorage.setItem("mock_username", updates.username);
    if (updates.phone) localStorage.setItem("mock_phone", updates.phone);
    if (updates.country) localStorage.setItem("mock_country", updates.country);
    return { error: null };
  },

  requestProfitWithdrawal: async (amount: number, token: string, network: string, address: string) => {
    await new Promise((res) => setTimeout(res, 800));
    addProfitWithdrawn(amount);
    return { error: null };
  },
  
  requestReferralWithdrawal: async (amount: number, token: string, network: string, address: string) => {
    await new Promise((res) => setTimeout(res, 800));
    withdrawReferralBonus(amount);
    return { error: null };
  }
};
