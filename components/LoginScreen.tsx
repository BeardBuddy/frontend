"use client";

import React, { useState } from "react";
import { api } from "@/lib/api/client";
import type { CustomerDto } from "@/lib/api/types";
import ShinyText from "@/common/components/ShinyText";
import { Scissors, AlertTriangle } from "lucide-react";

interface Props {
  onSignedIn: (customer: CustomerDto) => void;
}

type Mode = "signIn" | "register";

const inputClass =
  "rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors";

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  placeholder?: string;
}

const Field: React.FC<FieldProps> = ({ id, label, value, onChange, type = "text", autoComplete, required = true, placeholder }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      autoComplete={autoComplete}
      required={required}
      placeholder={placeholder}
      className={inputClass}
    />
  </div>
);

export const LoginScreen: React.FC<Props> = ({ onSignedIn }) => {
  const [mode, setMode] = useState<Mode>("signIn");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";

  const switchMode = () => {
    setMode(isRegister ? "signIn" : "register");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const customer = isRegister
        ? await api.register({
            username,
            password,
            firstName,
            lastName,
            phone,
            email: email.trim() || undefined,
          })
        : await api.login(username, password);
      onSignedIn(customer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
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
              {isRegister ? "Create Account" : "Member Sign In"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <Field id="firstName" label="First name" value={firstName} onChange={setFirstName} autoComplete="given-name" />
              <Field id="lastName" label="Last name" value={lastName} onChange={setLastName} autoComplete="family-name" />
            </div>
          )}

          <Field id="username" label="Username" value={username} onChange={setUsername} autoComplete="username" />

          {isRegister && (
            <>
              <Field id="phone" label="Phone" type="tel" value={phone} onChange={setPhone} autoComplete="tel" placeholder="+48 500 123 456" />
              <Field id="email" label="Email (optional)" type="email" value={email} onChange={setEmail} autoComplete="email" required={false} />
            </>
          )}

          <Field
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={isRegister ? "new-password" : "current-password"}
            placeholder={isRegister ? "At least 8 characters" : undefined}
          />

          {error && (
            <div className="rounded-xl border border-red-950 bg-red-950/20 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300/80 leading-relaxed">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 text-zinc-950 font-extrabold tracking-wide rounded-2xl py-3 shadow-lg shadow-amber-500/10 transition-all text-sm uppercase"
          >
            {submitting ? "Please wait…" : isRegister ? "Create Account" : "Sign In"}
          </button>

          <button
            type="button"
            onClick={switchMode}
            className="text-xs text-zinc-500 hover:text-amber-500 text-center mt-1 transition-colors"
          >
            {isRegister ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
