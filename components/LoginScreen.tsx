"use client";

import React, { useState } from "react";
import { api } from "@/lib/api/client";
import type { CustomerDto } from "@/lib/api/types";
import ShinyText from "@/common/components/ShinyText";
import { Scissors, AlertTriangle } from "lucide-react";

interface Props {
  onSignedIn: (customer: CustomerDto) => void;
}

export const LoginScreen: React.FC<Props> = ({ onSignedIn }) => {
  const [username, setUsername] = useState("alex");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      onSignedIn(await api.login(username, password));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950/60 p-8 backdrop-blur-md">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="bg-amber-500 text-zinc-950 p-2 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Scissors className="h-5 w-5 rotate-90" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider">
              <ShinyText text="GENTLEMEN'S CUT & CO." speed={5} className="font-extrabold" />
            </h1>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mt-0.5">
              Member Sign In
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              className="rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              className="rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-950 bg-red-950/20 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300/80 leading-relaxed">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold tracking-wide rounded-2xl py-3 shadow-lg shadow-amber-500/10 transition-all text-sm uppercase"
          >
            Sign In
          </button>

          <p className="text-[10px] text-zinc-600 text-center mt-1">
            Demo account — alex / password
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
