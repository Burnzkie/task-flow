"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "#f76a6a", MEDIUM: "#f5a623", LOW: "#5ec97c",
};

interface Props {
  data: { name: string; value: number }[];
}

export default function PriorityChart({ data }: Props) {
  const formatted = data.map((d) => ({
    name:  d.name[0] + d.name.slice(1).toLowerCase(),
    value: d.value,
    color: PRIORITY_COLORS[d.name] ?? "#888",
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} layout="vertical" margin={{ left: 0 }}>
        <XAxis type="number"   tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fill: "#888", fontSize: 12 }} axisLine={false} tickLine={false} width={56} />
        <Tooltip
          contentStyle={{
            background: "#1e1e22",
            // fixed: missing closing ) on rgba
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            fontSize: 12,
          }}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {formatted.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}