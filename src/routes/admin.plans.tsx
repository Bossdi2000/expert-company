import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Edit3, X, Crown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/plans")({
  head: () => ({ meta: [{ title: "Plans — Admin" }] }),
  component: AdminPlansPage,
});

type Plan = {
  id: string;
  name: string;
  tier: string;
  daily_roi_pct: number;
  duration_days: number;
  min_amount: number;
  max_amount: number;
  is_active: boolean;
  sort_order: number;
};

function AdminPlansPage() {
  const [list, setList] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("plans").select("*").order("sort_order");
    setList((data as Plan[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase
      .from("plans")
      .update({
        daily_roi_pct: Number(fd.get("roi")),
        duration_days: Number(fd.get("duration")),
        min_amount: Number(fd.get("min")),
        max_amount: Number(fd.get("max")),
      })
      .eq("id", editing.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Plan updated");
    setEditing(null);
    load();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="font-display text-3xl lg:text-4xl text-gradient-gold">Investment plans</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure and adjust the core ROI offerings for your investors.
        </p>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <div
              key={p.id}
              className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm transition-all hover:bg-white/[0.04] hover:border-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                  {p.tier}
                </div>
                {p.tier.toLowerCase() === "diamond" && <Crown size={14} className="text-primary" />}
              </div>
              <h3 className="mt-1 font-display text-2xl text-white group-hover:text-primary transition-colors">{p.name}</h3>
              
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl text-gradient-gold">{p.daily_roi_pct}%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">/ Day</span>
              </div>

              <div className="mt-4 space-y-2 border-t border-white/5 pt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase tracking-widest text-[9px]">Min — Max</span>
                  <span className="font-mono">{formatCurrency(p.min_amount)} — {formatCurrency(p.max_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase tracking-widest text-[9px]">Duration</span>
                  <span>{p.duration_days} Days</span>
                </div>
              </div>

              <button
                onClick={() => setEditing(p)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-[11px] font-bold uppercase tracking-wider transition-all hover:bg-white/10 hover:text-primary border border-white/5 active:scale-95"
              >
                <Edit3 size={13} /> Manage Plan
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 p-4 backdrop-blur-md sm:items-center">
          <form
            onSubmit={handleSave}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#050c0a] p-8 shadow-emerald animate-in zoom-in duration-300"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-2xl text-white">Edit {editing.name}</h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Daily ROI %" name="roi" defaultValue={editing.daily_roi_pct} />
              <Field
                label="Duration (days)"
                name="duration"
                defaultValue={editing.duration_days}
              />
              <Field label="Min amount" name="min" defaultValue={editing.min_amount} />
              <Field label="Max amount" name="max" defaultValue={editing.max_amount} />
            </div>
            <button
              disabled={saving}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold py-3.5 text-[11px] font-bold uppercase tracking-widest text-primary-foreground shadow-gold disabled:opacity-60 active:scale-95 transition-transform"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Update Configuration
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: number;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">{label}</label>
      <input
        type="number"
        step="0.01"
        name={name}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-display outline-none focus:border-primary transition-colors"
      />
    </div>
  );
}
