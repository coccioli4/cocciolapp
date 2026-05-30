export const family = {
  name: "Famiglia Coccioli",
  members: [
    { id: "gianluca", name: "Gianluca", role: "Owner", color: "bg-blue-500" },
    { id: "silvia", name: "Silvia", role: "Partner", color: "bg-pink-500" }
  ],
  child: { name: "Marco", birthDate: "2024-04-02" }
};

export const categories = [
  { id: "casa", name: "Casa", icon: "🏡", budget: 700 },
  { id: "alimentari", name: "Alimentari", icon: "🛒", budget: 600 },
  { id: "marco", name: "Marco", icon: "👶", budget: 350 },
  { id: "veicoli", name: "Veicoli", icon: "🚗", budget: 400 },
  { id: "viaggi", name: "Viaggi", icon: "✈️", budget: 250 },
  { id: "sport", name: "Sport", icon: "🏃", budget: 120 },
  { id: "tempo", name: "Tempo libero", icon: "🎉", budget: 250 }
];

export const sampleExpenses = [
  { id: 1, amount: 92, title: "Esselunga", category: "Alimentari", paidBy: "Silvia", date: "2026-05-29" },
  { id: 2, amount: 24, title: "Pannolini", category: "Marco", paidBy: "Gianluca", date: "2026-05-28" },
  { id: 3, amount: 680, title: "Assicurazione Volvo", category: "Veicoli", paidBy: "Famiglia", date: "2026-05-21" },
  { id: 4, amount: 49, title: "Filtri acqua", category: "Casa", paidBy: "Gianluca", date: "2026-05-18" }
];

export const reminders = [
  { id: 1, title: "Prenotare tagliando Volvo", due: "Oggi 18:00", assignedTo: "Gianluca", priority: "Alta", type: "Veicoli" },
  { id: 2, title: "Pagare assicurazione MP3", due: "Domani", assignedTo: "Gianluca", priority: "Alta", type: "Veicoli" },
  { id: 3, title: "Chiamare amministratore", due: "Venerdì", assignedTo: "Silvia", priority: "Media", type: "Casa" },
  { id: 4, title: "Prenotare centro estivo Marco", due: "25 giugno", assignedTo: "Entrambi", priority: "Media", type: "Marco" }
];

export const maintenance = [
  { id: 1, title: "Filtro Maunawai", due: "tra 12 giorni", status: "warning", recurrence: "6 mesi" },
  { id: 2, title: "Pulizia climatizzatori", due: "tra 24 giorni", status: "warning", recurrence: "annuale" },
  { id: 3, title: "Revisione Volvo", due: "tra 37 giorni", status: "ok", recurrence: "2 anni" },
  { id: 4, title: "Caldaia", due: "15/09/2026", status: "ok", recurrence: "annuale" }
];

export const shopping = ["Latte", "Banane", "Pannolini", "Carta igienica", "Detersivo"];
