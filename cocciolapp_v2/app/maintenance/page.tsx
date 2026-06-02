"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { CheckCircle2, Circle, Trash2, Wrench } from "lucide-react";
import { supabase } from "@/lib/supabase";

type MaintenanceItem = {
  id: number;
  text: string;
  category: string | null;
  due_date: string | null;
  frequency_months: number | null;
  completed: boolean;
  created_at: string;
};

const categories = ["Casa", "Auto", "Moto", "Giardino", "Documenti", "Altro"];

function addMonths(dateText: string, months: number) {
  const date = new Date(dateText);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split("T")[0];
}

function isOverdue(dateText: string | null) {
  if (!dateText) return false;
  const today = new Date().toISOString().split("T")[0];
  return dateText < today;
}

function formatDate(dateText: string | null) {
  if (!dateText) return "Nessuna scadenza";
  return new Date(dateText).toLocaleDateString("it-IT");
}

export default function MaintenancePage() {
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [status, setStatus] = useState("");

  async function loadItems() {
    const { data, error } = await supabase
      .from("maintenance")
      .select("*")
      .order("due_date", { ascending: true });

    if (error) {
      setStatus("Errore nel caricamento manutenzioni");
      console.error(error);
      return;
    }

    setItems(data || []);
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function updateItem(
    id: number,
    field: "text" | "category" | "due_date" | "frequency_months",
    value: string
  ) {
    const updateValue =
      field === "frequency_months" ? Number(value) || 0 : value || null;

    const { error } = await supabase
      .from("maintenance")
      .update({ [field]: updateValue })
      .eq("id", id);

    if (error) {
      setStatus("Errore aggiornamento manutenzione");
      console.error(error);
      return;
    }

    loadItems();
  }

  async function completeItem(item: MaintenanceItem) {
    const frequency = item.frequency_months || 12;
    const baseDate = item.due_date || new Date().toISOString().split("T")[0];
    const nextDate = addMonths(baseDate, frequency);

    const { error } = await supabase
      .from("maintenance")
      .update({
        completed: false,
        due_date: nextDate,
      })
      .eq("id", item.id);

    if (error) {
      setStatus("Errore completamento manutenzione");
      console.error(error);
      return;
    }

    setStatus("Manutenzione completata e nuova scadenza aggiornata");
    loadItems();
  }

  async function toggleCompleted(item: MaintenanceItem) {
    const { error } = await supabase
      .from("maintenance")
      .update({
        completed: !item.completed,
      })
      .eq("id", item.id);

    if (error) {
      setStatus("Errore aggiornamento stato");
      console.error(error);
      return;
    }

    loadItems();
  }

  async function deleteItem(id: number) {
    const { error } = await supabase.from("maintenance").delete().eq("id", id);

    if (error) {
      setStatus("Errore eliminazione manutenzione");
      console.error(error);
      return;
    }

    loadItems();
  }

  const openItems = items.filter((item) => !item.completed);
  const overdueItems = openItems.filter((item) => isOverdue(item.due_date));

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-32">
        <p className="text-sm font-semibold text-blue-500">
          Famiglia Coccioli
        </p>

        <h1 className="mt-1 text-4xl font-black tracking-tight">
          Manutenzioni
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Scadenze periodiche per casa, auto, moto e famiglia.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-violet-50 to-purple-100">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-3 text-violet-500 shadow-sm">
                <Wrench size={22} />
              </div>

              <div>
                <p className="text-sm font-semibold text-violet-700">
                  Aperte
                </p>
                <p className="text-3xl font-black">{openItems.length}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-orange-100">
            <p className="text-sm font-semibold text-red-600">Scadute</p>
            <p className="mt-2 text-3xl font-black">{overdueItems.length}</p>
          </Card>
        </div>

        {status && (
          <p className="mt-3 text-center text-xs text-zinc-500">{status}</p>
        )}

        <div className="mt-6 space-y-3">
          {items.length === 0 ? (
            <Card>
              <p className="text-sm text-zinc-500">
                Nessuna manutenzione ancora.
              </p>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id}>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleCompleted(item)}
                      className={
                        item.completed
                          ? "pt-1 text-green-500"
                          : "pt-1 text-zinc-400"
                      }
                    >
                      {item.completed ? (
                        <CheckCircle2 size={24} />
                      ) : (
                        <Circle size={24} />
                      )}
                    </button>

                    <div className="flex-1">
                      <input
                        value={item.text || ""}
                        onChange={(e) =>
                          updateItem(item.id, "text", e.target.value)
                        }
                        className="w-full rounded-2xl border border-black/10 bg-zinc-50 p-3 text-sm font-semibold"
                        placeholder="Descrizione"
                      />

                      <p
                        className={
                          isOverdue(item.due_date)
                            ? "mt-2 text-sm font-bold text-red-500"
                            : "mt-2 text-sm text-zinc-500"
                        }
                      >
                        Scadenza: {formatDate(item.due_date)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      className="rounded-full bg-red-50 p-3 text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={item.category || "Casa"}
                      onChange={(e) =>
                        updateItem(item.id, "category", e.target.value)
                      }
                      className="rounded-2xl border border-black/10 bg-zinc-50 p-3 text-sm"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <input
                      type="date"
                      value={item.due_date || ""}
                      onChange={(e) =>
                        updateItem(item.id, "due_date", e.target.value)
                      }
                      className="rounded-2xl border border-black/10 bg-zinc-50 p-3 text-sm"
                    />

                    <input
                      type="number"
                      value={item.frequency_months || 12}
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          "frequency_months",
                          e.target.value
                        )
                      }
                      className="rounded-2xl border border-black/10 bg-zinc-50 p-3 text-sm"
                      placeholder="Frequenza mesi"
                    />

                    <button
                      type="button"
                      onClick={() => completeItem(item)}
                      className="rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-600"
                    >
                      Eseguita
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