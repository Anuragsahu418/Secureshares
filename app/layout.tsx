import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SecureShare",
  description: "Encrypted, controlled file sharing with secure links.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen text-green-100">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-green-500/20 bg-black/60 backdrop-blur">
            <div className="container-page flex items-center justify-between py-4">
              <Link
                href="/"
                className="text-lg font-semibold tracking-wide text-green-300"
              >
                SecureShare
              </Link>
              <nav className="flex items-center gap-3 text-sm">
                <Link href="/dashboard" className="btn btn-ghost">
                  Dashboard
                </Link>
                <Link href="/login" className="btn btn-outline">
                  Log In
                </Link>
                <Link href="/signup" className="btn btn-primary">
                  Sign Up
                </Link>
              </nav>
            </div>
          </header>
          <main className="container-page flex-1 py-10">
            {children}
          </main>
          <footer className="border-t border-green-500/20 py-6 text-xs text-green-400/70">
            <div className="container-page flex flex-wrap items-center justify-between gap-2">
              <span>SecureShare</span>
              <span>Built for secure, frictionless collaboration.</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
