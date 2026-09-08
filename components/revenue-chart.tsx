"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RevenueChart({ data }: { data: { label: string; amount: number }[] }) {
  return <div className="h-48 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 0, left: -24, bottom: 0 }}><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#a7b4ad", fontSize: 10 }} /><YAxis hide /><Tooltip cursor={{ fill: "rgba(255,255,255,0.06)" }} formatter={(value) => [`${Number(value).toFixed(2)} €`, "Ingresos"]} contentStyle={{ borderRadius: 12, border: "none", background: "#173d2b", color: "white" }} /><Bar dataKey="amount" fill="#54c982" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}
