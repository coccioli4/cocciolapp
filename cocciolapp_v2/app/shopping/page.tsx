import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { shopping } from "@/lib/data";
import { Circle } from "lucide-react";
export default function ShoppingPage(){return <AppShell><div className="px-5 pt-8"><h1 className="text-4xl font-black tracking-tight">Spesa</h1><p className="mt-2 text-sm text-zinc-500">Lista condivisa live tra Gianluca e Silvia.</p><Card className="mt-6">{shopping.map(i=><div key={i} className="flex items-center gap-3 border-b border-black/5 py-3 last:border-0"><Circle className="text-green-500"/><p className="font-semibold">{i}</p></div>)}</Card></div></AppShell>}
