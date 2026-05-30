"use client";

import { ReactNode, useState } from "react";
import {
  Home,
  CalendarDays,
  Bell,
  House,
  Wallet,
  Users,
  Plus,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/calendar", label: "Agenda", icon: CalendarDays },
  { href: "/reminders", label: "Promemoria", icon: Bell },
  { href: "/maintenance", label: "Manutenzioni", icon: Wrench },
  { href: "/expenses", label: "Spese", icon: Wallet },
  { href: "/family", label: "Famiglia", icon: Users },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [quick, setQuick] = useState(false);

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-zinc-950">
      <div className="mx-auto min-h-screen max-w-md bg-[#f5f5f7] pb-28">
        {children}

        <Link
          href="/inbox"
          className="fixed bottom-32 left-1/2 z-50 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-2xl"
        >
          <Plus size={32} />
        </Link>

        <nav className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-md -translate-x-1/2 grid-cols-6 border-t border-black/5 bg-white/90 px-2 pb-5 pt-2 backdrop-blur">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 py-1"
              >
                <Icon
                  size={21}
                  className={
                    active ? "text-blue-500" : "text-zinc-400"
                  }
                />

                <span
                  className={
                    active
                      ? "text-[10px] font-bold text-blue-500"
                      : "text-[10px] text-zinc-400"
                  }
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </main>
  );
}