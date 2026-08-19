"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const DATA = [
  { month: "Mar", value: 18000 },
  { month: "Abr", value: 24500 },
  { month: "Mai", value: 22000 },
  { month: "Jun", value: 31000 },
  { month: "Jul", value: 36000 },
  { month: "Ago", value: 49000 },
];

export function DashboardChart({ value }: { value: number }) {
  const chart = DATA.map((point, index) =>
    index === DATA.length - 1 ? { ...point, value: Math.round(value / 100) } : point,
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chart}>
        <defs>
          <linearGradient id="pipelineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5E2BFF" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#5E2BFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" tick={{ fill: "#9B97B0", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            background: "#0B061A",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            color: "#F8F7FF",
          }}
          formatter={(amount) => [`R$ ${Number(amount).toLocaleString("pt-BR")}`, "Pipeline"]}
        />
        <Area type="monotone" dataKey="value" stroke="#C4B5FD" strokeWidth={2} fill="url(#pipelineFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
