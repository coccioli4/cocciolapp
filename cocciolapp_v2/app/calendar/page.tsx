"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { CalendarDays, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

type EventItem = {
  id: number;
  title: string;
  date: string;
  time: string;
  category: string;
  createdAt: string;
};

const STORAGE_KEY = "cocciolapp_events";

const categories = ["Famiglia", "Marco", "Lavoro", "Casa", "Viaggi", "Salute", "Altro"];

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export default function CalendarPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [visibleMonth, setVisibleMonth] = useState(new Date());

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  function saveEvents(next: EventItem[]) {
    setEvents(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function deleteEvent(id: number) {
    saveEvents(events.filter((event) => event.id !== id));
  }

  function updateEvent(id: number, category: string) {
    saveEvents(
      events.map((event) =>
        event.id === id ? { ...event, category } : event
      )
    );
  }

  function goToPreviousMonth() {
    setVisibleMonth(
      new Date(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth() - 1,
        1
      )
    );
  }

  function goToNextMonth() {
    setVisibleMonth(
      new Date(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth() + 1,
        1
      )
    );
  }

  function goToToday() {
    const today = new Date();
    setVisibleMonth(today);
    setSelectedDate(formatDate(today));
  }

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const daysInMonth = Array.from(
    { length: lastDay.getDate() },
    (_, i) => new Date(year, month, i + 1)
  );

  const emptyDays = Array.from({
    length: firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1,
  });

  const today = formatDate(new Date());

  const selectedEvents = events
    .filter((event) => event.date === selectedDate)
    .sort((a, b) =>
      (a.time || "00:00").localeCompare(b.time || "00:00")
    );

  const upcomingEvents = [...events]
    .filter((event) => event.date >= today)
    .sort((a, b) =>
      `${a.date}T${a.time || "00:00"}`.localeCompare(
        `${b.date}T${b.time || "00:00"}`
      )
    );

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-32">
        <p className="text-sm font-semibold text-blue-500">
          Famiglia Coccioli
        </p>

        <h1 className="mt-1 text-4xl font-black tracking-tight">
          Agenda
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Tocca un giorno per vedere gli eventi.
        </p>

        <Card className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="rounded-full bg-zinc-100 p-3"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="text-center">
              <h2 className="text-lg font-black capitalize">
                {visibleMonth.toLocaleString("it-IT", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>

              <button
                type="button"
                onClick={goToToday}
                className="mt-1 text-xs font-bold text-blue-500"
              >
                Oggi
              </button>
            </div>

            <button
              type="button"
              onClick={goToNextMonth}
              className="rounded-full bg-zinc-100 p-3"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-400">
            <span>L</span>
            <span>M</span>
            <span>M</span>
            <span>G</span>
            <span>V</span>
            <span>S</span>
            <span>D</span>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2">
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {daysInMonth.map((day) => {
              const dayText = formatDate(day);
              const hasEvent = events.some((event) => event.date === dayText);
              const isToday = dayText === today;
              const isSelected = dayText === selectedDate;

              return (
                <button
                  key={dayText}
                  type="button"
                  onClick={() => setSelectedDate(dayText)}
                  className={
                    isSelected
                      ? "flex h-11 flex-col items-center justify-center rounded-2xl bg-blue-500 text-white"
                      : isToday
                      ? "flex h-11 flex-col items-center justify-center rounded-2xl bg-blue-100 text-blue-700"
                      : "flex h-11 flex-col items-center justify-center rounded-2xl bg-zinc-50"
                  }
                >
                  <span className="text-sm font-bold">
                    {day.getDate()}
                  </span>

                  {hasEvent && (
                    <span
                      className={
                        isSelected
                          ? "mt-1 h-1 w-1 rounded-full bg-white"
                          : "mt-1 h-1 w-1 rounded-full bg-blue-500"
                      }
                    />
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="mt-6">
          <h2 className="text-lg font-bold">
            Eventi del giorno selezionato
          </h2>

          <div className="mt-3 space-y-3">
            {selectedEvents.length === 0 ? (
              <Card>
                <p className="text-sm text-zinc-500">
                  Nessun evento in questo giorno.
                </p>
              </Card>
            ) : (
              selectedEvents.map((event) => (
                <Card key={event.id}>
                  <div className="flex items-start gap-3">
                    <CalendarDays
                      size={20}
                      className="mt-1 text-blue-500"
                    />

                    <div className="flex-1">
                      <p className="font-semibold">
                        {event.title}
                      </p>

                      <p className="mt-1 text-lg font-black">
                        {event.time || "Tutto il giorno"}
                      </p>

                      <select
                        value={event.category}
                        onChange={(e) =>
                          updateEvent(event.id, e.target.value)
                        }
                        className="mt-3 w-full rounded-2xl border border-black/10 bg-zinc-50 p-3 text-sm"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>

                      <p className="mt-2 text-xs text-zinc-400">
                        Creato il {event.createdAt}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteEvent(event.id)}
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
          <h2 className="text-lg font-bold">Prossimi eventi</h2>

          <div className="mt-3 space-y-3">
            {upcomingEvents.length === 0 ? (
              <Card>
                <p className="text-sm text-zinc-500">
                  Nessun evento futuro.
                </p>
              </Card>
            ) : (
              upcomingEvents.map((event) => (
                <Card key={event.id}>
                  <p className="font-semibold">
                    {event.title}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    {event.date}
                    {event.time ? ` · ${event.time}` : ""} · {event.category}
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