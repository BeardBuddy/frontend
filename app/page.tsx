"use client";

import React, { useState } from "react";
import { SessionProvider, useSession } from "@/lib/store/session";
import Dashboard from "@/components/Dashboard";
import BookingWizard from "@/components/BookingWizard";
import ShinyText from "@/common/components/ShinyText";
import LoginScreen from "@/components/LoginScreen";
import { Scissors, Calendar, LayoutDashboard, LogOut } from "lucide-react";

function MainApp() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "booking">("dashboard");
  const [dataRevision, setDataRevision] = useState(0);
  const { customer, resolved, signIn, signOut } = useSession();

  return (
    <>
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="bg-amber-500 text-zinc-950 p-2 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10 hover:scale-105 transition-transform">
              <Scissors className="h-5 w-5 rotate-90" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider flex items-center">
                <ShinyText text="GENTLEMEN'S CUT & CO." speed={5} className="font-extrabold" />
              </h1>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mt-0.5">Premium Grooming Guild</span>
            </div>
          </div>
          <nav className="flex items-center bg-zinc-900/60 border border-zinc-850 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "dashboard" ? "bg-zinc-800 text-amber-500 shadow-sm" : "text-zinc-400 hover:text-zinc-100"}`}
            >
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab("booking")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "booking" ? "bg-zinc-800 text-amber-500 shadow-sm" : "text-zinc-400 hover:text-zinc-100"}`}
            >
              <Calendar className="h-4 w-4" /> Book Spot
            </button>
            {customer && (
              <button
                onClick={signOut}
                title="Sign out"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-100 transition-all"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {!resolved ? null : !customer ? (
          <LoginScreen onSignedIn={signIn} />
        ) : activeTab === "dashboard" ? (
          <Dashboard
            key={dataRevision}
            customer={customer}
            onStartBooking={() => setActiveTab("booking")}
          />
        ) : (
          <BookingWizard
            customer={customer}
            onCancelBooking={() => setActiveTab("dashboard")}
            onBooked={() => setDataRevision(prev => prev + 1)}
          />
        )}
      </main>
    </>
  );
}

export default function Home() {
  return (
    <SessionProvider>
      <MainApp />
    </SessionProvider>
  );
}
