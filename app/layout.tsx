import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BeardBuddy — Barbershop Appointments",
  description: "Premium grooming management system — book appointments, browse barbers, and manage your visit history.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        {children}
        <footer className="border-t border-zinc-900 bg-zinc-950/40 py-6 text-center text-xs text-zinc-600 mt-12">
          <p>© 2026 Gentlemen&apos;s Cut & Co. All Rights Reserved. Model Architecture & Systems Project.</p>
        </footer>
      </body>
    </html>
  );
}
