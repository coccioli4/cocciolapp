import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CocciolApp",
  description: "Famiglia, casa, promemoria, spese e manutenzioni condivise live.",
  manifest: "/manifest.json",
  themeColor: "#f5f5f7",
  appleWebApp: { capable: true, title: "CocciolApp", statusBarStyle: "default" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="it"><body>{children}</body></html>;
}
