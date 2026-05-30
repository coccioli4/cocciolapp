import { ReactNode } from "react";
export default function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[28px] border border-black/5 bg-white p-4 shadow-sm ${className}`}>{children}</section>;
}
