import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/deposits")({
  head: () => ({ meta: [{ title: "Deposits — Admin" }] }),
  component: AdminDepositsPage,
});

type Deposit = {
  id: string;
  user_id: string;
  amount: number;
  token: string;
  network: string;
  wallet_address: string;
  status: string;
  created_at: string;
  expires_at: string;
  notes: string | null;
  proof_url: string | null;
  profile?: { full_name: string | null; email: string | null; created_at: string };
};

type StatusFilter = "pending" | "completed" | "rejected" | "all";

function AdminDepositsPage() {
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [items, setItems] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: deps } = await supabase
      .from("deposits")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (deps && deps.length) {
      const ids = Array.from(new Set(deps.map((d) => d.user_id)));
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at")
        .in("id", ids);
      
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      setItems(deps.map((d) => ({ ...d, profile: map.get(d.user_id) ?? undefined })) as Deposit[]);
    } else {
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((d) => filter === "all" || d.status === filter);

  const counts = {
    pending: items.filter((d) => d.status === "pending").length,
    completed: items.filter((d) => d.status === "completed" || d.status === "received").length,
    rejected: items.filter((d) => d.status === "rejected").length,
    all: items.length,
  };

  const review = async (d: Deposit, action: "approve" | "reject") => {
    setActionId(d.id);
    const { error } =
      action === "approve"
        ? await supabase.rpc("admin_credit_deposit", { _deposit_id: d.id })
        : await supabase.rpc("admin_reject_deposit", {
            _deposit_id: d.id,
            _reason: "Payment not received — please make the payment again.",
          });
    setActionId(null);
    if (error) return toast.error(error.message);
    toast.success(action === "approve" ? "Credited to user" : "Rejected and user notified");

    // Fire transactional email (non-blocking)
    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: action === "approve" ? "deposit_approved" : "deposit_rejected",
        deposit_id: d.id,
      }),
    }).catch(() => {});

    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl lg:text-4xl">Deposit queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review user crypto deposits and credit balances on confirmation.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["pending", "completed", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
              filter === f
                ? "bg-gradient-gold text-primary-foreground shadow-gold"
                : "border border-border bg-background/40 text-foreground/80 hover:border-primary"
            }`}
          >
            {f}{" "}
            <span className="rounded-full bg-background/40 px-2 py-0.5 text-[10px]">
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
          {filtered.map((d) => (
            <div
              key={d.id}
              className="rounded-[2rem] border border-border/60 bg-card/40 p-6 backdrop-blur transition-all hover:bg-card/60"
            >
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex gap-4">
                   <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary font-display text-xl font-bold">
                     {d.profile?.full_name?.charAt(0) || "?"}
                   </div>
                   <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-bold">{d.profile?.full_name || "Unknown User"}</span>
                      {d.status === 'pending' && <span className="h-2 w-2 animate-ping rounded-full bg-warning"></span>}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <Mail size={12} />
                      <span>{d.profile?.email}</span>
                      <span>·</span>
                      <span>Joined {d.profile?.created_at ? new Date(d.profile.created_at).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      <span>Requested: {formatDateTime(d.created_at)}</span>
                      <span>·</span>
                      <span className="text-primary">{d.token} via {d.network}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-display text-3xl text-gradient-gold">
                    {formatCurrency(d.amount)}
                  </div>
                  <span
                    className={`mt-1.5 inline-block rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                      d.status === "completed" || d.status === "received"
                        ? "bg-success/15 text-success border border-success/20"
                        : d.status === "rejected"
                          ? "bg-destructive/15 text-destructive border border-destructive/20"
                          : "bg-warning/15 text-warning border border-warning/20"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              </div>

              {d.status === "pending" && (
                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/5 pt-5">
                  {d.proof_url ? (
                    <a
                      href={d.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-[11px] font-bold text-primary hover:bg-primary/30 transition-all border border-primary/20"
                    >
                      View Payment Proof
                    </a>
                  ) : (
                    <div className="rounded-xl bg-white/5 px-4 py-2.5 text-[11px] text-muted-foreground border border-white/5">
                      No proof uploaded
                    </div>
                  )}

                  <div className="ml-auto flex gap-2">
                    <button
                      disabled={actionId === d.id}
                      onClick={() => review(d, "approve")}
                      className="inline-flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-[11px] font-bold text-success-foreground hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
                    >
                      {actionId === d.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}{" "}
                      Approve & Credit
                    </button>
                    <button
                      disabled={actionId === d.id}
                      onClick={() => review(d, "reject")}
                      className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-5 py-2.5 text-[11px] font-bold text-white hover:bg-destructive/10 hover:text-destructive transition-all disabled:opacity-60"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              )}
              
              {d.notes && d.status === "rejected" && (
                <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-[11px] text-destructive italic">
                  Rejection Reason: {d.notes}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-3xl border border-border/60 bg-card/40 px-5 py-20 text-center text-sm text-muted-foreground italic font-medium">
              The queue is currently empty.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
