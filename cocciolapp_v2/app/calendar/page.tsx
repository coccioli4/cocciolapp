"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { CalendarDays, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type CalendarItem = {
  id: number;
  text: string;
  date: string | null;
  time: string | null;
  category: string | null;
  created_at: string;
};

const categories = ["Famiglia", "Salute", "Casa", "Lavoro", "Scadenze", "Altro"];

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function formatDate(dateText: string | null) {
  if (!dateText) return "Nessuna data";
  return new Date(dateText).toLocaleDateString("it-IT");
}

export default function CalendarPage() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [text, setText] = useState("");
  const [date, setDate] = useState(todayDate());
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("Famiglia");
  const [status, setStatus] = useState("");

  async function loadItems() {
    const { data, error } = await supabase
      .from("calendar")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (error) {
      setStatus("Errore nel caricamento calendario");
      console.error(error);
      return;
    }

    setItems(data || []);
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function addItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanText = text.trim();
    if (!cleanText) return;

    const { error } = await supabase.from("calendar").insert({
      id: Date.now(),
      text: cleanText,
      date,
      time: time || null,
      category,
      created_at: new Date().toISOString(),
    });

    if (error) {
      setStatus("Errore salvataggio evento");
      console.error(error);
      return;
    }

    setText("");
    setTime("");
    setCategory("Famiglia");
    setStatus("Evento aggiunto");
    loadItems();
  }

  async function updateItem(
    id: number,
    field: "text" | "date" | "time" | "category",
    value: string
  ) {
    const { error } = await supabase
      .from("calendar")
      .update({
        [field]: value || null,
      })
      .eq("id", id);

    if (error) {
      setStatus("Errore aggiornamento evento");
      console.error(error);
      return;
    }

    loadItems();
  }

  async function deleteItem(id: number) {
    const { error } = await supabase.from("calendar").delete().eq("id", id);

    if (error) {
      setStatus("Errore eliminazione evento");
      console.error(error);
      return;
    }

    loadItems();
  }

  const today = todayDate();
  const next7 = addDays(7);

  const todayItems = items.filter((item) => item.date === today);

  const nextItems = items.filter(
    (item) => item.date && item.date > today && item.date <= next7
  );

  const futureItems = items.filter((item) => item.date && item.date > next7);

  const noDateItems = items.filter((item) => !item.date);

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-32">
        <p className="text-sm font-semibold text-blue-500">
          Famiglia Coccioli
        </p>

        <h1 className="mt-1 text-4xl font-black tracking-tight">Agenda</h1>

        <p className="mt-2 text-sm text-zinc-500">
          Eventi e appuntamenti sincronizzati con Supabase.
        </p>

        <Card className="mt-6">
          <form onSubmit={addItem} className="space-y-4">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Es. pediatra Marco, cena, scadenza..."
              className="w-full rounded-3xl border border-black/10 bg-zinc-50 p-4 text-base outline-none"
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-3xl border border-black/10 bg-zinc-50 p-4 text-base outline-none"
              />

              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-3xl border border-black/10 bg-zinc-50 p-4 text-base outline-none"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-3xl border border-black/10 bg-zinc-50 p-4 text-base"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-3xl bg-green-500 px-4 py-4 text-base font-bold text-white shadow-lg active:scale-[0.98]"
            >
              <CalendarDays size={22} />
              Aggiungi evento
            </button>
          </form>

          {status && (
            <p className="mt-3 text-center text-xs text-zinc-500">{status}</p>
          )}
        </Card>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100">
            <p className="text-sm font-semibold text-green-700">Oggi</p>
            <p className="mt-2 text-3xl font-black">{todayItems.length}</p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-sky-100">
            <p className="text-sm font-semibold text-blue-700">
              Prossimi 7 giorni
            </p>
            <p className="mt-2 text-3xl font-black">{nextItems.length}</p>
          </Card>
        </div>

        <CalendarSection
          title="Oggi"
          items={todayItems}
          onUpdate={updateItem}
          onDelete={deleteItem}
        />

        <CalendarSection
          title="Prossimi 7 giorni"
          items={nextItems}
          onUpdate={updateItem}
          onDelete={deleteItem}
        />

        <CalendarSection
          title="Più avanti"
          items={futureItems}
          onUpdate={updateItem}
          onDelete={deleteItem}
        />

        <CalendarSection
          title="Senza data"
          items={noDateItems}
          onUpdate={updateItem}
          onDelete={deleteItem}
        />
      </div>
    </AppShell>
  );
}

function CalendarSection({
  title,
  items,
  onUpdate,
  onDelete,
}: {
  title: string;
  items: CalendarItem[];
  onUpdate: (
    id: number,
    field: "text" | "date" | "time" | "category",
    value: string
  ) => void;
  onDelete: (id: number) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold">{title}</h2>

      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <div className="flex items-start gap-3">
              <CalendarDays size={20} className="mt-1 text-green-500" />

              <div className="flex-1">
                <input
                  value={item.text || ""}
                  onChange={(e) => onUpdate(item.id, "text", e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-zinc-50 p-3 text-sm font-semibold"
                />

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={item.date || ""}
                    onChange={(e) =>
                      onUpdate(item.id, "date", e.target.value)
                    }
                    className="rounded-2xl border border-black/10 bg-zinc-50 p-3 text-sm"
                  />

                  <input
                    type="time"
                    value={item.time || ""}
                    onChange={(e) =>
                      onUpdate(item.id, "time", e.target.value)
                    }
                    className="rounded-2xl border border-black/10 bg-zinc-50 p-3 text-sm"
                  />
                </div>

                <select
                  value={item.category || "Famiglia"}
                  onChange={(e) =>
                    onUpdate(item.id, "category", e.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-zinc-50 p-3 text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-zinc-400">
                  {formatDate(item.date)}
                  {item.time ? ` · ${item.time}` : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="rounded-full bg-red-50 p-3 text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}