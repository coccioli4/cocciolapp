"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { Trash2, Wallet } from "lucide-react";

type PaidBy = "Gianluca" | "Silvia" | "Famiglia";
type Period = "current" | "previous" | "all";

type ExpenseItem = {
  id: number;
  description: string;
  amount: number;
  paidBy: PaidBy;
  category: string;
  createdAt: string;
};

const STORAGE_KEY = "cocciolapp_expenses";

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

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) setExpenses(JSON.parse(saved));
  }, []);

  function saveExpenses(next: ExpenseItem[]) {
    setExpenses(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function deleteExpense(id: number) {
    saveExpenses(expenses.filter((e) => e.id !== id));
  }

  function updateExpense(
    id: number,
    field: "category" | "paidBy",
    value: string
  ) {
    const next = expenses.map((expense) =>
      expense.id === id ? { ...expense, [field]: value } : expense
    );

    saveExpenses(next);
  }

  const filteredExpenses = expenses.filter((expense) => {
    if (period === "all") return true;
    if (period === "current") return isCurrentMonth(expense.createdAt);
    if (period === "previous") return isPreviousMonth(expense.createdAt);
    return true;
  });

  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const gianlucaTotal = filteredExpenses
    .filter((e) => e.paidBy === "Gianluca")
    .reduce((sum, e) => sum + e.amount, 0);

  const silviaTotal = filteredExpenses
    .filter((e) => e.paidBy === "Silvia")
    .reduce((sum, e) => sum + e.amount, 0);

  const familyTotal = filteredExpenses
    .filter((e) => e.paidBy === "Famiglia")
    .reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = categories
    .map((category) => ({
      category,
      total: filteredExpenses
        .filter((e) => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0),
    }))
    .filter((c) => c.total > 0);

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-32">
        <p className="text-sm font-semibold text-blue-500">
          Famiglia Coccioli
        </p>

        <h1 className="mt-1 text-4xl font-black tracking-tight">Spese</h1>

        <p className="mt-2 text-sm text-zinc-500">
          Spese familiari divise per mese, categoria e persona.
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
              {categoryTotals.map((c) => (
                <div key={c.category} className="flex justify-between text-sm">
                  <span>{c.category}</span>
                  <span className="font-bold">€ {c.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>
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
                    <p className="font-semibold">{expense.description}</p>

                    <p className="mt-1 text-lg font-black">
                      € {expense.amount.toFixed(2)}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <select
                        value={expense.category}
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
                        value={expense.paidBy}
                        onChange={(e) =>
                          updateExpense(expense.id, "paidBy", e.target.value)
                        }
                        className="rounded-2xl border border-black/10 bg-zinc-50 p-3 text-sm"
                      >
                        <option value="Gianluca">Gianluca</option>
                        <option value="Silvia">Silvia</option>
                        <option value="Famiglia">Famiglia</option>
                      </select>
                    </div>

                    <p className="mt-2 text-xs text-zinc-400">
                      {expense.createdAt}
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