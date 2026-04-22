"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props {
  data: { date: string; completed: number }[];
}

export default function ActivityChart({ data }: Props) {
  return ( // fixed: was "retrun"
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#7c6af7" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7c6af7" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        {/* fixed: was datakey (lowercase k) */}
        <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
        {/* fixed: fontSize was inside the fill string */}
        <YAxis allowDecimals={false} tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "#1e1e22",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            fontSize: 12,
          }}
          cursor={{ stroke: "rgba(255,255,255,0.1)" }}
        />
        <Area
          type="monotone"
          dataKey="completed"
          stroke="#7c6af7"
          strokeWidth={2}
          fill="url(#activityGradient)"
          dot={{ fill: "#7c6af7", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}