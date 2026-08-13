"use client";

import { useMemo, useState } from "react";
import { Panel } from "reactflow";
import { useSelector } from "react-redux";
import { Coins, X, Activity, Clock, CircleDollarSign, MessageSquare, Braces } from "lucide-react";

/**
 * Formats a duration in milliseconds into a short human-readable string.
 * e.g. 12049.8 -> "12.05s", 1200 -> "1.2s", 500 -> "500ms".
 */
const formatDuration = (ms) => {
  const value = Number(ms);
  if (!Number.isFinite(value)) return "—";
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}s`;
  }
  return `${Math.round(value)}ms`;
};

/**
 * Normalises the (future) `price_usage` payload into `{ amount, symbol }`.
 * The price may arrive as a number, a pre-formatted string (₹/$) or an object
 * such as `{ amount, currency: "INR" | "USD" }`. Falls back to ₹0 when absent.
 */
const normalizePrice = (price) => {
  if (price == null || price === "") return { amount: 0, symbol: "₹" };

  // Object shape: { amount, currency } (INR/USD/RS/RUPEE/DOLLAR...)
  if (typeof price === "object") {
    const amount = Number(price.amount ?? price.value ?? price.total ?? price.price ?? 0);
    const currency = String(price.currency ?? "").toUpperCase();
    const symbol =
      currency === "USD" || currency === "DOLLAR" || currency === "$"
        ? "$"
        : currency === "INR" || currency === "RUPEE" || currency === "RS"
        ? "₹"
        : "₹";
    return { amount: Number.isFinite(amount) ? amount : 0, symbol };
  }

  // String may already carry a currency sign.
  if (typeof price === "string") {
    if (/[$]|usd|dollar/i.test(price)) {
      const num = Number.parseFloat(price.replace(/[^0-9.-]/g, ""));
      return { amount: Number.isFinite(num) ? num : 0, symbol: "$" };
    }
    if (/₹|rs|inr|rupee/i.test(price)) {
      const num = Number.parseFloat(price.replace(/[^0-9.-]/g, ""));
      return { amount: Number.isFinite(num) ? num : 0, symbol: "₹" };
    }
    const num = Number.parseFloat(price);
    return { amount: Number.isFinite(num) ? num : 0, symbol: "₹" };
  }

  const num = Number(price);
  return { amount: Number.isFinite(num) ? num : 0, symbol: "₹" };
};

const formatAmount = (amount) => {
  if (!Number.isFinite(amount) || amount === 0) return "0.00";
  const rounded = Math.round(amount * 10000) / 10000;
  const str = rounded.toString();
  if (!str.includes(".")) return `${str}.00`;
  const [int, dec] = str.split(".");
  return `${int}.${dec.padEnd(2, "0").slice(0, 4)}`;
};

const Stat = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-100 last:border-0">
    <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
      <Icon size={13} className="text-slate-400" />
      {label}
    </span>
    <span className="text-[11.5px] font-semibold text-slate-800 font-mono">{value}</span>
  </div>
);

/**
 * Small floating usage readout for the studio canvas. Renders a compact button
 * that toggles a card (below it) summarising the last run's `token_usage` and
 * `price_usage` returned by the invoke API.
 */
const TokenUsageWidget = () => {
  const tokenUsage = useSelector((state) => state?.studio?.tokenUsage);
  const priceUsage = useSelector((state) => state?.studio?.priceUsage);
  const [open, setOpen] = useState(false);

  const price = useMemo(() => normalizePrice(priceUsage), [priceUsage]);

  const hasUsage = Boolean(tokenUsage && typeof tokenUsage === "object");
  const model =
    tokenUsage?.calls?.[0]?.model ||
    Object.values(tokenUsage?.per_node || {})[0]?.model ||
    null;

  let totalTokens = null;
  if (tokenUsage) {
    if (tokenUsage.total_tokens != null) {
      totalTokens = tokenUsage.total_tokens;
    } else {
      totalTokens =
        (tokenUsage.total_prompt_tokens || 0) +
        (tokenUsage.total_completion_tokens || 0);
    }
  }

  return (
    <Panel position="top-left" className="!m-3">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-slate-200 bg-white/95 text-slate-600 shadow-sm backdrop-blur transition-colors hover:bg-slate-50 hover:text-slate-900"
          title="Token & cost usage"
        >
          <Coins size={13} className={open ? "text-indigo-600" : "text-slate-400"} />
          <span className="text-[11px] font-semibold">Usage</span>
          <span className="text-[10px] font-mono text-slate-400">
            {hasUsage ? `${totalTokens}` : "0"}
          </span>
        </button>

        {open && (
          <div className="absolute left-0 top-9 z-50 w-64 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Last Run Usage
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close usage panel"
              >
                <X size={13} />
              </button>
            </div>

            {!hasUsage ? (
              <p className="py-3 text-center text-[11.5px] text-slate-400">
                Run the workflow to see token usage.
              </p>
            ) : (
              <div>
                {model && (
                  <div className="mb-1.5 flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1.5 text-[10.5px] font-mono text-slate-500">
                    <Braces size={12} className="text-indigo-500 shrink-0" />
                    <span className="truncate">{model}</span>
                  </div>
                )}

                <Stat
                  icon={MessageSquare}
                  label="LLM Calls"
                  value={tokenUsage.total_llm_calls ?? 0}
                />
                <Stat
                  icon={Activity}
                  label="Prompt Tokens"
                  value={tokenUsage.total_prompt_tokens ?? 0}
                />
                <Stat
                  icon={Activity}
                  label="Completion Tokens"
                  value={tokenUsage.total_completion_tokens ?? 0}
                />
                <Stat
                  icon={Coins}
                  label="Total Tokens"
                  value={totalTokens ?? 0}
                />
                <Stat
                  icon={Clock}
                  label="Duration"
                  value={formatDuration(tokenUsage.total_llm_duration_ms)}
                />

                <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-indigo-50/70 border border-indigo-100 px-2.5 py-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700">
                    <CircleDollarSign size={13} />
                    Estimated Cost
                  </span>
                  <span className="text-[12px] font-bold text-indigo-700 font-mono">
                    {price.symbol}
                    {formatAmount(price.amount)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
};

export default TokenUsageWidget;
