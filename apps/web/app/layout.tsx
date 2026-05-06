import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans-google", display: "swap" });
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display-google",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-google",
  display: "swap",
});

export const metadata: Metadata = {
  title: "G3MX — Gamified Marketplace for Boosts, Accounts & Top-ups",
  description:
    "The crypto-native marketplace for game boosting, account trading, and in-game top-ups. Verified boosters, escrow protection, on-chain rewards.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "G3MX — Level up. Trade accounts. Top up cheaper.",
    description:
      "Gamified Web2/Web3 marketplace for game boosting, account trading, and in-game top-ups.",
    images: [
      { url: "/brand/g3mx-logo.png", width: 1536, height: 1024, alt: "G3MX" },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "G3MX — Level up. Trade accounts. Top up cheaper.",
    images: ["/brand/g3mx-logo.png"],
  },
  icons: {
    icon: "/brand/g3mx-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} ${mono.variable}`}>
      <body>
        <Providers>
          <div className="lg:flex min-h-screen">
            <Sidebar />
            <div className="lg:flex-1 lg:min-w-0">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
