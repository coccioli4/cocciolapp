"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { Plus, Trash2, Wallet, Bell, CalendarDays } from "lucide-react";

type InboxItem = {
  id: number;
  text: string;
  createdAt: string;
};

type ExpenseItem = {
  id: number;
  description: string;
  amount: number;
  paidBy: "Gianluca" | "Silvia" | "Famiglia";
  category: string;
  createdAt: string;
};

type ReminderItem = {
  id: number;
  text: string;
  createdAt: string;
  completed: boolean;
};

type EventItem = {
  id: number;
  title: string;
  date: string;
  time: string;
  category: string;
  createdAt: string;
};

const INBOX_KEY = "cocciolapp_inbox";
const EXPENSES_KEY = "cocciolapp_expenses";
const REMINDERS_KEY = "cocciolapp_reminders";
const EVENTS_KEY = "cocciolapp_events";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function guessCategory(text: string) {
  const value = text.toLowerCase();

  if (
    value.includes("esselunga") ||
    value.includes("coop") ||
    value.includes("conad") ||
    value.includes("carrefour") ||
    value.includes("lidl") ||
    value.includes("eurospin") ||
    value.includes("supermercato")
  ) {
    return "Alimentari";
  }

  if (
    value.includes("marco") ||
    value.includes("asilo") ||
    value.includes("pediatra") ||
    value.includes("pannolini") ||
    value.includes("farmacia")
  ) {
    return "Marco";
  }

  if (
    value.includes("volvo") ||
    value.includes("xc40") ||
    value.includes("mp3") ||
    value.includes("moto") ||
    value.includes("piaggio") ||
    value.includes("benzina") ||
    value.includes("diesel") ||
    value.includes("carburante") ||
    value.includes("gomme") ||
    value.includes("tagliando")
  ) {
    return "Auto";
  }

  if (
    value.includes("ikea") ||
    value.includes("leroy") ||
    value.includes("casa") ||
    value.includes("caldaia") ||
    value.includes("climatizzatore") ||
    value.includes("filtro") ||
    value.includes("maunawai")
  ) {
    return "Casa";
  }

  if (
    value.includes("hotel") ||
    value.includes("volo") ||
    value.includes("treno") ||
    value.includes("viaggio")
  ) {
    return "Viaggi";
  }

  if (
    value.includes("scarpe") ||
    value.includes("corsa") ||
    value.includes("palestra") ||
    value.includes("running")
  ) {
    return "Sport";
  }

  return "Da classificare";
}

function guessEventCategory(text: string) {
  const value = text.toLowerCase();

  if (
    value.includes("marco") ||
    value.includes("asilo") ||
    value.includes("pediatra") ||
    value.includes("vaccino")
  ) {
    return "Marco";
  }

  if (
    value.includes("trasferta") ||
    value.includes("riunione") ||
    value.includes("lavoro")
  ) {
    return "Lavoro";
  }

  if (
    value.includes("casa") ||
    value.includes("condominio") ||
    value.includes("amministratore")
  ) {
    return "Casa";
  }

  if (
    value.includes("viaggio") ||
    value.includes("hotel") ||
    value.includes("treno") ||
    value.includes("volo")
  ) {
    return "Viaggi";
  }

  if (
    value.includes("medico") ||
    value.includes("dentista") ||
    value.includes("visita")
  ) {
    return "Salute";
  }

  return "Famiglia";
}

function parseEventFromText(text: string) {
  const now = new Date();

  const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  const timeMatch = text.match(/(\d{1,2})[:.](\d{2})/);

  let date = todayISO();

  if (dateMatch) {
    const day = Number(dateMatch[1]);
    const month = Number(dateMatch[2]) - 1;
    let year = dateMatch[3] ? Number(dateMatch[3]) : now.getFullYear();

    if (year < 100) {
      year = 2000 + year;
    }

    const parsedDate = new Date(year, month, day);
    date = parsedDate.toISOString().split("T")[0];
  }

  const time = timeMatch
    ? `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`
    : "";

  let title = text;

  if (dateMatch) {
    title = title.replace(dateMatch[0], "");
  }

  if (timeMatch) {
    title = title.replace(timeMatch[0], "");
  }

  title = title.trim();

  return {
    title: title.length > 0 ? title : text,
    date,
    time,
  };
}

export default function InboxPage() {
  const [text, setText] = useState("");
  const [items, setItems] = useState<InboxItem[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(INBOX_KEY);
    if (saved) setItems(JSON.parse(saved));
  }, []);

  function saveInbox(nextItems: InboxItem[]) {
    setItems(nextItems);
    window.localStorage.setItem(INBOX_KEY, JSON.stringify(nextItems));
  }

  function addItem() {
    const cleanText = text.trim();
    if (!cleanText) return;

    const newItem: InboxItem = {
      id: Date.now(),
      text: cleanText,
      createdAt: new Date().toLocaleString("it-IT"),
    };

    saveInbox([newItem, ...items]);
    setText("");
    setStatus("Aggiunto alla Inbox");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    addItem();
  }

  function deleteItem(id: number) {
    saveInbox(items.filter((item) => item.id !== id));
  }

  function transformToExpense(item: InboxItem) {
    const saved = window.localStorage.getItem(EXPENSES_KEY);
    const expenses: ExpenseItem[] = saved ? JSON.parse(saved) : [];

    const amountMatch = item.text.match(/(\d+[,.]?\d*)/);

    const amount = amountMatch
      ? Number(amountMatch[1].replace(",", "."))
      : 0;

    const description = amountMatch
      ? item.text.replace(amountMatch[0], "").replace(/euro|€/gi, "").trim()
      : item.text;

    const newExpense: ExpenseItem = {
      id: Date.now(),
      description: description.length > 0 ? description : item.text,
      amount,
      paidBy: "Famiglia",
      category: guessCategory(item.text),
      createdAt: new Date().toLocaleString("it-IT"),
    };

    window.localStorage.setItem(
      EXPENSES_KEY,
      JSON.stringify([newExpense, ...expenses])
    );

    deleteItem(item.id);
    setStatus("Elemento trasformato in spesa");
  }

  function transformToReminder(item: InboxItem) {
    const saved = window.localStorage.getItem(REMINDERS_KEY);
    const reminders: ReminderItem[] = saved ? JSON.parse(saved) : [];

    const newReminder: ReminderItem = {
      id: Date.now(),
      text: item.text,
      createdAt: new Date().toLocaleString("it-IT"),
      completed: false,
    };

    window.localStorage.setItem(
      REMINDERS_KEY,
      JSON.stringify([newReminder, ...reminders])
    );

    deleteItem(item.id);
    setStatus("Elemento trasformato in promemoria");
  }

  function transformToEvent(item: InboxItem) {
    const saved = window.localStorage.getItem(EVENTS_KEY);
    const events: EventItem[] = saved ? JSON.parse(saved) : [];

    const parsed = parseEventFromText(item.text);

    const newEvent: EventItem = {
      id: Date.now(),
      title: parsed.title,
      date: parsed.date,
      time: parsed.time,
      category: guessEventCategory(item.text),
      createdAt: new Date().toLocaleString("it-IT"),
    };

    window.localStorage.setItem(
      EVENTS_KEY,
      JSON.stringify([newEvent, ...events])
    );

    deleteItem(item.id);
    setStatus("Elemento trasformato in evento");
  }

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-32">
        <p className="text-sm font-semibold text-blue-500">Famiglia Coccioli</p>

        <h1 className="mt-1 text-4xl font-black tracking-tight">Inbox</h1>

        <p className="mt-2 text-sm text-zinc-500">
          Scrivi al volo una cosa da ricordare. Poi trasformala in spesa,
          promemoria, evento o manutenzione.
        </p>

        <Card className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Es. 42 euro Esselunga, pediatra Marco 14/06 10:30..."
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
                      Inserito il {item.createdAt}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => transformToExpense(item)}
                      className="flex items-center justify-center gap-1 rounded-2xl bg-blue-50 p-3 text-xs font-bold text-blue-600"
                    >
                      <Wallet size={16} />
                      Spesa
                    </button>

                    <button
                      type="button"
                      onClick={() => transformToReminder(item)}
                      className="flex items-center justify-center gap-1 rounded-2xl bg-amber-50 p-3 text-xs font-bold text-amber-600"
                    >
                      <Bell size={16} />
                      Promemoria
                    </button>

                    <button
                      type="button"
                      onClick={() => transformToEvent(item)}
                      className="flex items-center justify-center gap-1 rounded-2xl bg-purple-50 p-3 text-xs font-bold text-purple-600"
                    >
                      <CalendarDays size={16} />
                      Evento
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      className="flex items-center justify-center gap-1 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-500"
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