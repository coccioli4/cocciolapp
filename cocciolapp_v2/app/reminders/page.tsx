"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { CheckCircle2, Circle, Trash2, Bell } from "lucide-react";

type Reminder = {
  id: number;
  text: string;
  createdAt: string;
  completed: boolean;
  completedAt?: string;
};

const STORAGE_KEY = "cocciolapp_reminders";
const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: Reminder[] = JSON.parse(saved);

      const cleaned = parsed.filter((reminder) => {
        if (!reminder.completed) return true;
        if (!reminder.completedAt) return true;

        const completedTime = new Date(
          reminder.completedAt
        ).getTime();

        return Date.now() - completedTime < FORTY_EIGHT_HOURS;
      });

      setReminders(cleaned);
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cleaned)
      );
    }
  }, []);

  function saveReminders(next: Reminder[]) {
    setReminders(next);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next)
    );
  }

  function toggleReminder(id: number) {
    const next = reminders.map((reminder) => {
      if (reminder.id !== id) return reminder;

      const completed = !reminder.completed;

      return {
        ...reminder,
        completed,
        completedAt: completed
          ? new Date().toISOString()
          : undefined,
      };
    });

    saveReminders(next);
  }

  function deleteReminder(id: number) {
    saveReminders(
      reminders.filter((reminder) => reminder.id !== id)
    );
  }

  const openReminders = reminders.filter(
    (r) => !r.completed
  );

  const completedReminders = reminders.filter(
    (r) => r.completed
  );

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-32">
        <p className="text-sm font-semibold text-blue-500">
          Famiglia Coccioli
        </p>

        <h1 className="mt-1 text-4xl font-black tracking-tight">
          Promemoria
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          I promemoria completati spariscono
          automaticamente dopo 48 ore.
        </p>

        <Card className="mt-6 bg-gradient-to-br from-amber-50 to-orange-100">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white p-3 text-amber-500 shadow-sm">
              <Bell size={22} />
            </div>

            <div>
              <p className="text-sm font-semibold text-amber-700">
                Promemoria aperti
              </p>

              <p className="text-3xl font-black">
                {openReminders.length}
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-6">
          <h2 className="text-lg font-bold">
            Da fare
          </h2>

          <div className="mt-3 space-y-3">
            {openReminders.length === 0 ? (
              <Card>
                <p className="text-sm text-zinc-500">
                  Nessun promemoria aperto.
                </p>
              </Card>
            ) : (
              openReminders.map((reminder) => (
                <Card key={reminder.id}>
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        toggleReminder(reminder.id)
                      }
                      className="pt-1 text-zinc-400"
                    >
                      <Circle size={24} />
                    </button>

                    <div className="flex-1">
                      <p className="text-base font-semibold">
                        {reminder.text}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Creato il {reminder.createdAt}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        deleteReminder(reminder.id)
                      }
                      className="rounded-full bg-red-50 p-3 text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold">
            Completati
          </h2>

          <div className="mt-3 space-y-3">
            {completedReminders.length === 0 ? (
              <Card>
                <p className="text-sm text-zinc-500">
                  Nessun promemoria completato
                  nelle ultime 48 ore.
                </p>
              </Card>
            ) : (
              completedReminders.map((reminder) => (
                <Card key={reminder.id}>
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        toggleReminder(reminder.id)
                      }
                      className="pt-1 text-green-500"
                    >
                      <CheckCircle2 size={24} />
                    </button>

                    <div className="flex-1">
                      <p className="text-base text-zinc-400 line-through">
                        {reminder.text}
                      </p>

                      <p className="mt-1 text-xs text-zinc-400">
                        Completato da meno di 48 ore
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        deleteReminder(reminder.id)
                      }
                      className="rounded-full bg-red-50 p-3 text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}