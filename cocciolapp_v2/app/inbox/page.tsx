"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import {
  Plus,
  Trash2,
  Bell,
  Wallet,
  Wrench,
  CalendarDays,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type InboxItem = {
  id: number;
  text: string;
  created_at: string;
};

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function parseExpense(text: string) {
  const match = text.match(/(.+?)\s+(\d+[.,]?\d*)$/);

  const description = match ? match[1].trim() : text.trim();
  const amount = match ? Number(match[2].replace(",", ".")) : 0;

  const lower = description.toLowerCase();

  let category = "Da classificare";

  if (
    lower.includes("esselunga") ||
    lower.includes("coop") ||
    lower.includes("conad") ||
    lower.includes("lidl") ||
    lower.includes("eurospin") ||
    lower.includes("alimentari")
  ) {
    category = "Alimentari";
  } else if (
    lower.includes("volvo") ||
    lower.includes("benzina") ||
    lower.includes("diesel") ||
    lower.includes("tagliando") ||
    lower.includes("gomme") ||
    lower.includes("auto") ||
    lower.includes("moto") ||
    lower.includes("mp3")
  ) {
    category = "Auto";
  } else if (
    lower.includes("asilo") ||
    lower.includes("pediatra") ||
    lower.includes("marco") ||
    lower.includes("farmacia")
  ) {
    category = "Marco";
  } else if (
    lower.includes("ikea") ||
    lower.includes("leroy") ||
    lower.includes("casa") ||
    lower.includes("caldaia")
  ) {
    category = "Casa";
  }

  return { description, amount, category };
}

export default function InboxPage() {
  const [text, setText] = useState("");
  const [items, setItems] = useState<InboxItem[]>([]);
  const [status, setStatus] = useState("");

  async function loadItems() {
    const { data, error } = await supabase
      .from("inbox")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setStatus("Errore nel caricamento Inbox");
      console.error(error);
      return;
    }

    setItems(data || []);
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanText = text.trim();
    if (!cleanText) return;

    const { error } = await supabase.from("inbox").insert({
      id: Date.now(),
      text: cleanText,
      created_at: new Date().toISOString(),
    });

    if (error) {
      setStatus("Errore nel salvataggio");
      console.error(error);
      return;
    }

    setText("");
    setStatus("Aggiunto alla Inbox");
    loadItems();
  }

  async function deleteItem(id: number) {
    const { error } = await supabase.from("inbox").delete().eq("id", id);

    if (error) {
      setStatus("Errore eliminazione");
      console.error(error);
      return;
    }

    setStatus("Elemento eliminato");
    loadItems();
  }

  async function transformToReminder(item: InboxItem) {
    const { error } = await supabase.from("reminders").insert({
      id: Date.now(),
      text: item.text,
      created_at: new Date().toISOString(),
      completed: false,
    });

    if (error) {
      alert(JSON.stringify(error));
      console.error(error);
      return;
    }

    await deleteItem(item.id);
  }

  async function transformToExpense(item: InboxItem) {
    const parsed = parseExpense(item.text);

    const { error } = await supabase.from("expenses").insert({
      id: Date.now(),
      text: item.text,
      description: parsed.description,
      amount: parsed.amount,
      category: parsed.category,
      paid_by: "Famiglia",
      created_at: new Date().toISOString(),
    });

    if (error) {
      alert(JSON.stringify(error));
      console.error(error);
      return;
    }

    await deleteItem(item.id);
  }

  async function transformToMaintenance(item: InboxItem) {
    const { error } = await supabase.from("maintenance").insert({
      id: Date.now(),
      text: item.text,
      category: "Casa",
      due_date: null,
      completed: false,
      created_at: new Date().toISOString(),
    });

    if (error) {
      alert(JSON.stringify(error));
      console.error(error);
      return;
    }

    await deleteItem(item.id);
  }

  async function transformToEvent(item: InboxItem) {
    const { error } = await supabase.from("events").insert({
      id: Date.now(),
      text: item.text,
      date: todayDate(),
      time: null,
      category: "Famiglia",
      created_at: new Date().toISOString(),
    });

    if (error) {
      alert(JSON.stringify(error));
      console.error(error);
      return;
    }

    await deleteItem(item.id);
  }

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-32">
        <p className="text-sm font-semibold text-blue-500">
          Famiglia Coccioli
        </p>

        <h1 className="mt-1 text-4xl font-black tracking-tight">Inbox</h1>

        <p className="mt-2 text-sm text-zinc-500">
          Scrivi al volo qualcosa e poi trasformalo in promemoria, spesa,
          manutenzione o evento.
        </p>

        <Card className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Es. esselunga 42, comprare latte, tagliando Volvo..."
              className="h-32 w-full rounded-3xl border border-black/10 bg-zinc-50 p-4 text-base outline-none"
            />

            <button
              type="submit"
              className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-3xl bg-blue-500 px-4 py-4 text-base font-bold text-white shadow-lg active:scale-[0.98]"
            >
              <Plus size={22} />
              Aggiungi alla Inbox
            </button>
          </form>

          {status && (
            <p className="mt-3 text-center text-xs text-zinc-500">{status}</p>
          )}
        </Card>

        <div className="mt-6 space-y-3">
          {items.length === 0 ? (
            <Card>
              <p className="text-sm text-zinc-500">Nessun elemento ancora.</p>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id}>
                <div className="space-y-3">
                  <div>
                    <p className="text-base font-semibold">{item.text}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Inserito il {item.created_at}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => transformToReminder(item)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-600"
                    >
                      <Bell size={16} />
                      Promemoria
                    </button>

                    <button
                      type="button"
                      onClick={() => transformToExpense(item)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-blue-50 p-3 text-sm font-bold text-blue-600"
                    >
                      <Wallet size={16} />
                      Spesa
                    </button>

                    <button
                      type="button"
                      onClick={() => transformToMaintenance(item)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-violet-50 p-3 text-sm font-bold text-violet-600"
                    >
                      <Wrench size={16} />
                      Manutenzione
                    </button>

                    <button
                      type="button"
                      onClick={() => transformToEvent(item)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-600"
                    >
                      <CalendarDays size={16} />
                      Evento
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-500"
                    >
                      <Trash2 size={16} />
                      Elimina
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}