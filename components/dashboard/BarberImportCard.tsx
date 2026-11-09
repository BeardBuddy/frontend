"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { LoadBarbersResponse } from "@/lib/api/types";
import { Users, AlertTriangle, CheckCircle2 } from "lucide-react";

/**
 * Triggers the Kafka pipeline: the API publishes one barber.created event per barber and returns
 * 202 right away; the worker then creates the barbers, links them to services and generates
 * their schedules. The backend enforces a per-user cooldown, mirrored here as a countdown.
 */
export const BarberImportCard: React.FC = () => {
  const [result, setResult] = useState<LoadBarbersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [nextAllowedAt, setNextAllowedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (nextAllowedAt === null) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [nextAllowedAt]);

  const secondsLeft = nextAllowedAt === null ? 0 : Math.max(0, Math.ceil((nextAllowedAt - now) / 1000));
  const coolingDown = secondsLeft > 0;

  const handleImport = async () => {
    setError(null);
    setRunning(true);
    try {
      const response = await api.importBarbers();
      setResult(response);
      setNextAllowedAt(Date.parse(response.nextImportAt));
      setNow(Date.now());
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setRunning(false);
    }
  };

  const formatWait = (seconds: number) =>
    seconds >= 60 ? `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s` : `${seconds}s`;

  return (
    <div className="h-fit rounded-3xl border border-zinc-800 bg-zinc-950/50 p-6 backdrop-blur-md">
      <h3 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2">
        <Users className="h-5 w-5 text-amber-500" /> Import Barbers
      </h3>
      <p className="text-sm text-zinc-400 mt-2">
        Adds a batch of new barbers through Kafka. Their schedules are generated in the background, so they
        appear in booking a few seconds later.
      </p>

      <button
        onClick={handleImport}
        disabled={running || coolingDown}
        className="w-full mt-6 border border-amber-500/60 text-amber-500 hover:bg-amber-500/10 disabled:opacity-50 disabled:hover:bg-transparent font-extrabold tracking-wide rounded-2xl py-3 px-4 transition-all text-sm uppercase"
      >
        {running ? "Importing…" : coolingDown ? `Available in ${formatWait(secondsLeft)}` : "Import Barbers"}
      </button>

      {result && (
        <div className="mt-4 rounded-xl border border-emerald-950 bg-emerald-950/20 p-3 flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-300/80 leading-relaxed">
            {result.published} barbers sent to <span className="font-mono">{result.topic}</span>. Schedules run{" "}
            {result.validFrom} → {result.validTo}.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-950 bg-red-950/20 p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-300/80 leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  );
};

export default BarberImportCard;
