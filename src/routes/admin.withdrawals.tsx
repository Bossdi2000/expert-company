import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, Mail, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/withdrawals")({
  head: () => ({ meta: [{ title: "Withdrawals — Admin" }] }),
  component: AdminWithdrawalsPage,
});

type Withdrawal = {
  id: string;
  user_id: string;
  amount: number;
  token: string;
  network: string;
  destination_address: string;
  status: string;
  created_at: string;
  notes: string | null;
  profile?: { full_name: string | null; email: string | null };
};

type StatusFilter = "pending" | "approved" | "rejected" | "all";

function AdminWithdrawalsPage() {
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [items, setItems] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: wds } = await supabase
      .from("withdrawals")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (wds && wds.length) {
      const ids = Array.from(new Set(wds.map((w) => w.user_id)));
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ids);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      setItems(wds.map((w) => ({ ...w, profile: map.get(w.user_id) ?? undefined })) as Withdrawal[]);
    } else {
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((w) => filter === "all" || w.status === filter);

  const counts = {
    pending: items.filter((w) => w.status === "pending").length,
    approved: items.filter((w) => w.status === "approved").length,
    rejected: items.filter((w) => w.status === "rejected").length,
    all: items.length,
  };

  const review = async (w: Withdrawal, action: "approve" | "reject") => {
    setActionId(w.id);
    const { error } =
      action === "approve"
        ? await supabase.rpc("admin_approve_withdrawal", { _withdrawal_id: w.id })
        : await supabase.rpc("admin_reject_withdrawal", {
            _withdrawal_id: w.id,
            _reason: "Withdrawal rejected. Please contact support for details.",
          });
    setActionId(null);
    
    if (error) return toast.error(error.message);
    toast.success(action === "approve" ? "Marked as sent" : "Rejected and funds returned");

    // Fire transactional email (non-blocking)
    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: action === "approve" ? "withdrawal_approved" : "withdrawal_rejected",
        withdrawal_id: w.id,
      }),
    }).catch(() => {});

    load();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="font-display text-3xl lg:text-4xl text-gradient-gold">Withdrawal requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and process user withdrawal requests. Funds are deducted from user balance on request.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
              filter === f
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-white/5"
            }`}
          >
            {f}
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${filter === f ? "bg-white/20" : "bg-white/10"}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => (
            <div
              key={w.id}
              className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm transition-all hover:bg-white/[0.04] hover:border-white/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg">{w.profile?.full_name || "Unknown user"}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      · {w.profile?.email}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{formatDateTime(w.created_at)}</span>
                    <span className="h-1 w-1 rounded-full bg-white/10" />
                    <span className="text-primary font-medium">{w.token} on {w.network}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-black/40 border border-white/5 px-3 py-2 font-mono text-[10px] group-hover:border-primary/20 transition-colors">
                    <span className="text-muted-foreground uppercase tracking-widest mr-2">Address:</span>
                    <span className="truncate select-all">{w.destination_address}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-display text-2xl text-gradient-gold">
                    {formatCurrency(w.amount)}
                  </div>
                  <span
                    className={`mt-1.5 inline-block rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${
                      w.status === "approved"
                        ? "bg-success/15 text-success border border-success/20"
                        : w.status === "rejected"
                          ? "bg-destructive/15 text-destructive border border-destructive/20"
                          : "bg-warning/15 text-warning border border-warning/20"
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
              </div>

              {w.status === "pending" && (
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    disabled={actionId === w.id}
                    onClick={() => review(w, "approve")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
                  >
                    {actionId === w.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={13} />
                    )}{" "}
                    Approve & Mark Sent
                  </button>
                  <button
                    disabled={actionId === w.id}
                    onClick={() => review(w, "reject")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-destructive/10 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all disabled:opacity-60"
                  >
                    <XCircle size={13} /> Reject — Refund user
                  </button>
                  {w.profile?.email && (
                    <a
                      href={`mailto:${w.profile.email}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider hover:bg-white/10 border border-white/5 transition-all"
                    >
                      <Mail size={13} /> Contact User
                    </a>
                  )}
                </div>
              )}
              
              {w.notes && w.status === "rejected" && (
                <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-[11px] text-destructive flex items-start gap-2">
                  <XCircle size={12} className="mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold uppercase tracking-wider text-[9px] block mb-0.5">Rejection Reason</span>
                    {w.notes}
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] px-5 py-16 text-center text-sm text-muted-foreground">
              <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <ExternalLink size={20} className="text-muted-foreground/40" />
              </div>
              The withdrawal queue is currently empty.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
