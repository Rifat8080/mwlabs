"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Mar", revenue: 38, target: 42 },
  { month: "Apr", revenue: 46, target: 44 },
  { month: "May", revenue: 43, target: 47 },
  { month: "Jun", revenue: 58, target: 50 },
  { month: "Jul", revenue: 63, target: 54 },
  { month: "Aug", revenue: 71, target: 58 },
];

export function RevenueChart() {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#155dfc" stopOpacity={0.3} />
              <stop offset="72%" stopColor="#0188ec" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#02d1fa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#dbeafe" strokeDasharray="3 3" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#45556c" }} dy={8} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#62748e" }} tickFormatter={(value) => `$${value}k`} />
          <Tooltip
            cursor={{ stroke: "#02d1fa", strokeDasharray: "3 3" }}
            contentStyle={{ borderRadius: 12, border: "1px solid #dbeafe", boxShadow: "0 14px 40px rgba(21,93,252,.12)", fontSize: 12 }}
            formatter={(value) => [`$${value}k`]}
          />
          <Area type="monotone" dataKey="target" stroke="#90a1b9" fill="transparent" strokeDasharray="4 5" strokeWidth={1.5} />
          <Area type="monotone" dataKey="revenue" stroke="#155dfc" fill="url(#revenueGradient)" strokeWidth={2.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
