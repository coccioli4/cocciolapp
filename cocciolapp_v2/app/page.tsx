"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { Bell, CalendarDays, Wallet, Wrench } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Reminder = {
  id: number;
  text: string;
  completed: boolean;
};

type Expense = {
  id: number;
  amount: number | string | null;
  created_at: string;
};

type Maintenance = {
  id: number;
  text: string;
  due_date: string | null;
  completed: boolean;
};

type CalendarItem = {
  id: number;
  text: string;
  date: string | null;
  time: string | null;
  category: string | null;
};

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function isCurrentMonth(dateText: string) {
  const date = new Date(dateText);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function formatDate(dateText: string | null) {
  if (!dateText) return "Senza data";
  return new Date(dateText).toLocaleDateString("it-IT");
}

export default function HomePage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [calendar, setCalendar] = useState<CalendarItem[]>([]);

  async function loadData() {
    const [remindersRes, expensesRes, maintenanceRes, calendarRes] =
      await Promise.all([
        supabase.from("reminders").select("*").order("id", { ascending: false }),
        supabase.from("expenses").select("*").order("id", { ascending: false }),
        supabase.from("maintenance").select("*").order("due_date", { ascending: true }),
        supabase.from("calendar").select("*").order("date", { ascending: true }),
      ]);

    if (!remindersRes.error) setReminders(remindersRes.data || []);
    if (!expensesRes.error) setExpenses(expensesRes.data || []);
    if (!maintenanceRes.error) setMaintenance(maintenanceRes.data || []);
    if (!calendarRes.error) setCalendar(calendarRes.data || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  const today = todayDate();
  const next7 = addDays(7);
  const next30 = addDays(30);

  const openReminders = reminders.filter((item) => !item.completed);

  const monthlyTotal = expenses
    .filter((item) => item.created_at && isCurrentMonth(item.created_at))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const overdueMaintenance = maintenance.filter(
    (item) => !item.completed && item.due_date && item.due_date < today
  );

  const upcomingMaintenance = maintenance
    .filter(
      (item) =>
        !item.completed &&
        item.due_date &&
        item.due_date >= today &&
        item.due_date <= next30
    )
    .slice(0, 5);

  const nextEvents = calendar
    .filter((item) => item.date && item.date >= today && item.date <= next7)
    .sort((a, b) =>
      `${a.date || ""}T${a.time || "00:00"}`.localeCompare(
        `${b.date || ""}T${b.time || "00:00"}`
      )
    )
    .slice(0, 5);

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
            <p className="mt-3 text-3xl font-black">{openReminders.length}</p>
            <p className="text-sm font-semibold text-red-600">
              Promemoria aperti
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-sky-100">
            <Wallet className="text-blue-500" />
            <p className="mt-3 text-3xl font-black">
              € {monthlyTotal.toFixed(2)}
            </p>
            <p className="text-sm font-semibold text-blue-600">
              Spese mese
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-violet-50 to-indigo-100">
            <Wrench className="text-violet-500" />
            <p className="mt-3 text-3xl font-black">
              {overdueMaintenance.length}
            </p>
            <p className="text-sm font-semibold text-violet-600">
              Manutenzioni scadute
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100">
            <CalendarDays className="text-green-500" />
            <p className="mt-3 text-3xl font-black">{nextEvents.length}</p>
            <p className="text-sm font-semibold text-green-600">
              Eventi 7 giorni
            </p>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold">Prossimi eventi</h2>

          <div className="mt-3 space-y-3">
            {nextEvents.length === 0 ? (
              <Card>
                <p className="text-sm text-zinc-500">
                  Nessun evento nei prossimi 7 giorni.
                </p>
              </Card>
            ) : (
              nextEvents.map((item) => (
                <Card key={item.id}>
                  <p className="font-semibold">{item.text}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {formatDate(item.date)}
                    {item.time ? ` · ${item.time}` : ""}
                    {item.category ? ` · ${item.category}` : ""}
                  </p>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold">Promemoria aperti</h2>

          <div className="mt-3 space-y-3">
            {openReminders.length === 0 ? (
              <Card>
                <p className="text-sm text-zinc-500">
                  Nessun promemoria aperto.
                </p>
              </Card>
            ) : (
              openReminders.slice(0, 5).map((item) => (
                <Card key={item.id}>
                  <p className="font-semibold">{item.text}</p>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold">Manutenzioni in scadenza</h2>

          <div className="mt-3 space-y-3">
            {upcomingMaintenance.length === 0 ? (
              <Card>
                <p className="text-sm text-zinc-500">
                  Nessuna manutenzione nei prossimi 30 giorni.
                </p>
              </Card>
            ) : (
              upcomingMaintenance.map((item) => (
                <Card key={item.id}>
                  <p className="font-semibold">{item.text}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Scadenza: {formatDate(item.due_date)}
                  </p>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}