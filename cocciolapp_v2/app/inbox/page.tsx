"use client";

import { FormEvent, useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { Plus, Trash2, Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";

type InboxItem = {
id: number;
text: string;
created_at: string;
};

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

const newItem: InboxItem = {
  id: Date.now(),
  text: cleanText,
  created_at: new Date().toLocaleString("it-IT"),
};

const { error } = await supabase
  .from("inbox")
  .insert(newItem);

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
const { error } = await supabase
.from("inbox")
.delete()
.eq("id", id);
if (error) {
  setStatus("Errore eliminazione");
  console.error(error);
  return;
}

setStatus("Elemento eliminato");
loadItems();

}

async function transformToReminder(item: InboxItem) {
const { error } = await supabase
.from("reminders")
.insert({
id: Date.now(),
text: item.text,
created_at: new Date().toLocaleString("it-IT"),
completed: false,
});

if (error) {
  alert(JSON.stringify(error));
  console.error(error);
  return;
}

await deleteItem(item.id);


}

return ( <AppShell> <div className="px-5 pt-8 pb-32"> <p className="text-sm font-semibold text-blue-500">
Famiglia Coccioli </p>

```
    <h1 className="mt-1 text-4xl font-black tracking-tight">
      Inbox
    </h1>

    <p className="mt-2 text-sm text-zinc-500">
      Questa Inbox ora salva i dati su Supabase, quindi saranno visibili da
      più dispositivi.
    </p>

    <Card className="mt-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Es. comprare latte, pediatra Marco, 42 Esselunga..."
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
        <p className="mt-3 text-center text-xs text-zinc-500">
          {status}
        </p>
      )}
    </Card>

    <div className="mt-6 space-y-3">
  {items.length === 0 ? (
    <Card>
      <p className="text-sm text-zinc-500">
        Nessun elemento ancora.
      </p>
    </Card>
  ) : (
    items.map((item) => (
      <Card key={item.id}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-base font-semibold">
              {item.text}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Inserito il {item.created_at}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => transformToReminder(item)}
              className="rounded-full bg-amber-50 p-3 text-amber-600"
            >
              <Bell size={18} />
            </button>

            <button
              type="button"
              onClick={() => deleteItem(item.id)}
              className="rounded-full bg-red-50 p-3 text-red-500"
            >
              <Trash2 size={18} />
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