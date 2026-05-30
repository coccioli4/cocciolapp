"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import {
  Bell,
  CalendarDays,
  Home,
  ShoppingCart,
  Wallet,
  Wrench,
} from "lucide-react";

type EventItem = {
  id: number;
  title: string;
  date: string;
  time: string;
  category: string;
  createdAt: string;
};

type ReminderItem = {
  id: number;
  text: string;
  createdAt: string;
  completed: boolean;
};

type ExpenseItem = {
  id: number;
  description: string;
  amount: number;
  paidBy: "Gianluca" | "Silvia" | "Famiglia";
  category: string;
  createdAt: string;
};

const EVENTS_KEY = "cocciolapp_events";
const REMINDERS_KEY = "cocciolapp_reminders";
const EXPENSES_KEY = "cocciolapp_expenses";

function todayText() {
  return new Date().toISOString().split("T")[0];
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export default function HomePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  useEffect(() => {
    const savedEvents = window.localStorage.getItem(EVENTS_KEY);
    const savedReminders = window.localStorage.getItem(REMINDERS_KEY);
    const savedExpenses = window.localStorage.getItem(EXPENSES_KEY);

    if (savedEvents) setEvents(JSON.parse(savedEvents));
    if (savedReminders) setReminders(JSON.parse(savedReminders));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
  }, []);

  const today = todayText();
  const next7 = addDays(7);

  const todayEvents = events
    .filter((event) => event.date === today)
    .sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));

  const nextEvents = events
    .filter((event) => event.date > today && event.date <= next7)
    .sort((a, b) =>
      `${a.date}T${a.time || "00:00"}`.localeCompare(
        `${b.date}T${b.time || "00:00"}`
      )
    );

  const openReminders = reminders.filter((r) => !r.completed);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = expenses.filter((expense) => {
    const date = new Date(expense.createdAt);
    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  });

  const monthlyTotal = monthlyExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-32">
        <p className="text-sm font-semibold text-blue-500">
          Famiglia Coccioli
        </p>

        <h1 className="mt-1 text-4xl font-black tracking-tight">
          CocciolApp
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Casa, famiglia, spese e promemoria condivisi.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-red-50 to-rose-100">
            <Bell className="text-red-500" />
            <p className="mt-3 text-3xl font-black">
              {openReminders.length}
            </p>
            <p className="text-sm font-semibold text-red-600">
              Promemoria
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-violet-50 to-indigo-100">
            <Wrench className="text-violet-500" />
            <p className="mt-3 text-3xl font-black">0</p>
            <p className="text-sm font-semibold text-violet-600">
              Manutenzioni
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-sky-100">
            <Wallet className="text-blue-500" />
            <p className="mt-3 text-3xl font-black">
              € {monthlyTotal.toFixed(0)}
            </p>
            <p className="text-sm font-semibold text-blue-600">
              Spese mese
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100">
            <ShoppingCart className="text-green-500" />
            <p className="mt-3 text-3xl font-black">0</p>
            <p className="text-sm font-semibold text-green-600">
              Lista spesa
            </p>
          </Card>
        </div>

        <Card className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">Oggi</h2>
            <CalendarDays className="text-blue-500" />
          </div>

          {todayEvents.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Nessun evento per oggi.
            </p>
          ) : (
            <div className="space-y-3">
              {todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="border-l-4 border-blue-500 pl-3"
                >
                  <p className="font-bold">{event.title}</p>
                  <p className="text-sm text-zinc-500">
                    {event.time || "Tutto il giorno"} · {event.category}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Prossimi 7 giorni
            </h2>
            <Home className="text-zinc-400" />
          </div>

          {nextEvents.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Nessun evento nei prossimi 7 giorni.
            </p>
          ) : (
            <div className="space-y-3">
              {nextEvents.map((event) => (
                <div
                  key={event.id}
                  className="border-l-4 border-purple-500 pl-3"
                >
                  <p className="font-bold">{event.title}</p>
                  <p className="text-sm text-zinc-500">
                    {event.date}
                    {event.time ? ` · ${event.time}` : ""} · {event.category}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="mt-4">
          <h2 className="mb-3 text-xl font-bold">
            Promemoria urgenti
          </h2>

          {openReminders.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Nessun promemoria aperto.
            </p>
          ) : (
            <div className="space-y-3">
              {openReminders.slice(0, 3).map((reminder) => (
                <div key={reminder.id}>
                  <p className="font-semibold">{reminder.text}</p>
                  <p className="text-xs text-zinc-500">
                    Creato il {reminder.createdAt}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}