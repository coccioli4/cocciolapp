"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { CheckCircle2, Trash2, Wrench } from "lucide-react";

type MaintenanceItem = {
  id: number;
  title: string;
  category: string;
  dueDate: string;
  frequencyMonths: number;
  createdAt: string;
};

const STORAGE_KEY = "cocciolapp_maintenance";

const categories = [
  "Casa",
  "Auto",
  "Caldaia",
  "Filtri",
  "Climatizzatori",
  "Altro",
];

function addMonths(dateText: string, months: number) {
  const date = new Date(dateText);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split("T")[0];
}

function daysUntil(dateText: string) {
  const today = new Date();
  const target = new Date(dateText);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export default function MaintenancePage() {
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Casa");
  const [dueDate, setDueDate] = useState("");
  const [frequencyMonths, setFrequencyMonths] = useState(6);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) setItems(JSON.parse(saved));
  }, []);

  function saveItems(next: MaintenanceItem[]) {
    setItems(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function addItem() {
    if (!title.trim() || !dueDate) return;

    const newItem: MaintenanceItem = {
      id: Date.now(),
      title: title.trim(),
      category,
      dueDate,
      frequencyMonths,
      createdAt: new Date().toLocaleString("it-IT"),
    };

    saveItems([newItem, ...items]);
    setTitle("");
    setDueDate("");
    setFrequencyMonths(6);
  }

  function completeItem(id: number) {
    const next = items.map((item) =>
      item.id === id
        ? {
            ...item,
            dueDate: addMonths(item.dueDate, item.frequencyMonths),
          }
        : item
    );

    saveItems(next);
  }

  function deleteItem(id: number) {
    saveItems(items.filter((item) => item.id !== id));
  }

  const sortedItems = [...items].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const urgentItems = sortedItems.filter((item) => daysUntil(item.dueDate) <= 30);

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-32">
        <p className="text-sm font-semibold text-blue-500">Famiglia Coccioli</p>

        <h1 className="mt-1 text-4xl font-black tracking-tight">
          Manutenzioni
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Casa, auto, filtri, caldaia e scadenze periodiche.
        </p>

        <Card className="mt-6 bg-gradient-to-br from-violet-50 to-indigo-100">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white p-3 text-violet-500 shadow-sm">
              <Wrench size={22} />
            </div>

            <div>
              <p className="text-sm font-semibold text-violet-700">
                In scadenza entro 30 giorni
              </p>
              <p className="text-3xl font-black">{urgentItems.length}</p>
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <h2 className="text-lg font-bold">Nuova manutenzione</h2>

          <div className="mt-4 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Filtro Maunawai, tagliando Volvo..."
              className="w-full rounded-3xl border border-black/10 bg-zinc-50 p-4 text-base outline-none"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-3xl border border-black/10 bg-zinc-50 p-4 text-base"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-3xl border border-black/10 bg-zinc-50 p-4 text-base outline-none"
            />

            <select
              value={frequencyMonths}
              onChange={(e) => setFrequencyMonths(Number(e.target.value))}
              className="w-full rounded-3xl border border-black/10 bg-zinc-50 p-4 text-base"
            >
              <option value={1}>Ogni mese</option>
              <option value={3}>Ogni 3 mesi</option>
              <option value={6}>Ogni 6 mesi</option>
              <option value={12}>Ogni anno</option>
              <option value={24}>Ogni 2 anni</option>
            </select>

            <button
              type="button"
              onClick={addItem}
              className="flex min-h-[56px] w-full items-center justify-center rounded-3xl bg-blue-500 px-4 py-4 text-base font-bold text-white shadow-lg active:scale-[0.98]"
            >
              Aggiungi manutenzione
            </button>
          </div>
        </Card>

        <div className="mt-6 space-y-3">
          {sortedItems.length === 0 ? (
            <Card>
              <p className="text-sm text-zinc-500">
                Nessuna manutenzione registrata.
              </p>
            </Card>
          ) : (
            sortedItems.map((item) => {
              const days = daysUntil(item.dueDate);
              const isUrgent = days <= 30;

              return (
                <Card key={item.id}>
                  <div className="flex items-start gap-3">
                    <Wrench
                      size={20}
                      className={
                        isUrgent ? "mt-1 text-orange-500" : "mt-1 text-blue-500"
                      }
                    />

                    <div className="flex-1">
                      <p className="font-semibold">{item.title}</p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {item.category}
                      </p>

                      <p
                        className={
                          isUrgent
                            ? "mt-2 text-lg font-black text-orange-500"
                            : "mt-2 text-lg font-black"
                        }
                      >
                        {days < 0
                          ? `Scaduta da ${Math.abs(days)} giorni`
                          : days === 0
                          ? "Scade oggi"
                          : `Tra ${days} giorni`}
                      </p>

                      <p className="text-xs text-zinc-400">
                        Prossima scadenza: {item.dueDate}
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => completeItem(item.id)}
                          className="flex items-center justify-center gap-2 rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-600"
                        >
                          <CheckCircle2 size={17} />
                          Fatto
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          className="flex items-center justify-center gap-2 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-500"
                        >
                          <Trash2 size={17} />
                          Elimina
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}