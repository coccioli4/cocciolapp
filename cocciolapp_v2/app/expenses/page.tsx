"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { Trash2, Wallet } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Period = "current" | "previous" | "all";

type ExpenseItem = {
  id: number;
  text: string | null;
  description: string | null;
  amount: number | string | null;
  paid_by: string | null;
  category: string | null;
  created_at: string;
};

const categories = [
  "Da classificare",
  "Alimentari",
  "Marco",
  "Casa",
  "Auto",
  "Viaggi",
  "Sport",
  "Tempo libero",
];

const paidByOptions = ["Gianluca", "Silvia", "Famiglia"];

function amountValue(expense: ExpenseItem) {
  return Number(expense.amount || 0);
}

function isCurrentMonth(dateText: string) {
  const date = new Date(dateText);
  const now = new Date();

  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function isPreviousMonth(dateText: string) {
  const date = new Date(dateText);
  const now = new Date();
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  return (
    date.getMonth() === previous.getMonth() &&
    date.getFullYear() === previous.getFullYear()
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [period, setPeriod] = useState<Period>("current");
  const [status, setStatus] = useState("");

  async function loadExpenses() {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setStatus("Errore nel caricamento spese");
      console.error(error);
      return;
    }

    setExpenses(data || []);
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  async function deleteExpense(id: number) {
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) {
      setStatus("Errore eliminazione spesa");
      console.error(error);
      return;
    }

    loadExpenses();
  }

  async function updateExpense(
    id: number,
    field: "description" | "amount" | "category" | "paid_by",
    value: string
  ) {
    const updateValue =
      field === "amount" ? Number(value.replace(",", ".")) || 0 : value;

    const { error } = await supabase
      .from("expenses")
      .update({ [field]: updateValue })
      .eq("id", id);

    if (error) {
      setStatus("Errore aggiornamento spesa");
      console.error(error);
      return;
    }

    loadExpenses();
  }

  const filteredExpenses = expenses.filter((expense) => {
    if (period === "all") return true;
    if (period === "current") return isCurrentMonth(expense.created_at);
    if (period === "previous") return isPreviousMonth(expense.created_at);
    return true;
  });

  const total = filteredExpenses.reduce(
    (sum, expense) => sum + amountValue(expense),
    0
  );

  const gianlucaTotal = filteredExpenses
    .filter((expense) => expense.paid_by === "Gianluca")
    .reduce((sum, expense) => sum + amountValue(expense), 0);

  const silviaTotal = filteredExpenses
    .filter((expense) => expense.paid_by === "Silvia")
    .reduce((sum, expense) => sum + amountValue(expense), 0);

  const familyTotal = filteredExpenses
    .filter((expense) => expense.paid_by === "Famiglia")
    .reduce((sum, expense) => sum + amountValue(expense), 0);

  const categoryTotals = categories
    .map((category) => ({
      category,
      total: filteredExpenses
        .filter((expense) => expense.category === category)
        .reduce((sum, expense) => sum + amountValue(expense), 0),
    }))
    .filter((item) => item.total > 0);

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-32">
        <p className="text-sm font-semibold text-blue-500">
          Famiglia Coccioli
        </p>

        <h1 className="mt-1 text-4xl font-black tracking-tight">Spese</h1>

        <p className="mt-2 text-sm text-zinc-500">
          Spese familiari sincronizzate con Supabase.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setPeriod("current")}
            className={
              period === "current"
                ? "rounded-2xl bg-blue-500 p-3 text-sm font-bold text-white"
                : "rounded-2xl bg-white p-3 text-sm font-bold text-zinc-500"
            }
          >
            Questo mese
          </button>

          <button
            type="button"
            onClick={() => setPeriod("previous")}
            className={
              period === "previous"
                ? "rounded-2xl bg-blue-500 p-3 text-sm font-bold text-white"
                : "rounded-2xl bg-white p-3 text-sm font-bold text-zinc-500"
            }
          >
            Mese scorso
          </button>

          <button
            type="button"
            onClick={() => setPeriod("all")}
            className={
              period === "all"
                ? "rounded-2xl bg-blue-500 p-3 text-sm font-bold text-white"
                : "rounded-2xl bg-white p-3 text-sm font-bold text-zinc-500"
            }
          >
            Tutto
          </button>
        </div>

        <Card className="mt-4 bg-gradient-to-br from-blue-50 to-sky-100">
          <p className="text-sm font-semibold text-blue-600">
            Totale periodo
          </p>

          <p className="mt-2 text-4xl font-black">€ {total.toFixed(2)}</p>
        </Card>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Card>
            <p className="text-xs text-zinc-500">Gianluca</p>
            <p className="mt-1 font-black">€ {gianlucaTotal.toFixed(2)}</p>
          </Card>

          <Card>
            <p className="text-xs text-zinc-500">Silvia</p>
            <p className="mt-1 font-black">€ {silviaTotal.toFixed(2)}</p>
          </Card>

          <Card>
            <p className="text-xs text-zinc-500">Famiglia</p>
            <p className="mt-1 font-black">€ {familyTotal.toFixed(2)}</p>
          </Card>
        </div>

        {categoryTotals.length > 0 && (
          <Card className="mt-4">
            <p className="mb-3 font-bold">Totali per categoria</p>

            <div className="space-y-2">
              {categoryTotals.map((item) => (
                <div
                  key={item.category}
                  className="flex justify-between text-sm"
                >
                  <span>{item.category}</span>
                  <span className="font-bold">
                    € {item.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {status && (
          <p className="mt-3 text-center text-xs text-zinc-500">{status}</p>
        )}

        <div className="mt-6 space-y-3">
          {filteredExpenses.length === 0 ? (
            <Card>
              <p className="text-sm text-zinc-500">
                Nessuna spesa in questo periodo.
              </p>
            </Card>
          ) : (
            filteredExpenses.map((expense) => (
              <Card key={expense.id}>
                <div className="flex items-start gap-3">
                  <Wallet size={20} className="mt-1 text-blue-500" />

                  <div className="flex-1">
                    <input
                      value={
                        expense.description ||
                        expense.text ||
                        ""
                      }
                      onChange={(e) =>
                        updateExpense(
                          expense.id,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full rounded-2xl border border-black/10 bg-zinc-50 p-3 text-sm font-semibold"
                      placeholder="Descrizione"
                    />

                    <input
                      value={String(expense.amount || "")}
                      onChange={(e) =>
                        updateExpense(expense.id, "amount", e.target.value)
                      }
                      className="mt-2 w-full rounded-2xl border border-black/10 bg-zinc-50 p-3 text-lg font-black"
                      placeholder="Importo"
                      inputMode="decimal"
                    />

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <select
                        value={expense.category || "Da classificare"}
                        onChange={(e) =>
                          updateExpense(expense.id, "category", e.target.value)
                        }
                        className="rounded-2xl border border-black/10 bg-zinc-50 p-3 text-sm"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>

                      <select
                        value={expense.paid_by || "Famiglia"}
                        onChange={(e) =>
                          updateExpense(expense.id, "paid_by", e.target.value)
                        }
                        className="rounded-2xl border border-black/10 bg-zinc-50 p-3 text-sm"
                      >
                        {paidByOptions.map((person) => (
                          <option key={person} value={person}>
                            {person}
                          </option>
                        ))}
                      </select>
                    </div>

                    <p className="mt-2 text-xs text-zinc-400">
                      {new Date(expense.created_at).toLocaleString("it-IT")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteExpense(expense.id)}
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
    </AppShell>
  );
}