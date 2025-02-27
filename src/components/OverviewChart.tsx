"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  {
    name: "Jan",
    revenue: 4000,
    users: 2400
  },
  {
    name: "Feb",
    revenue: 3000,
    users: 1398
  },
  {
    name: "Mar",
    revenue: 2000,
    users: 9800
  },
  {
    name: "Apr",
    revenue: 2780,
    users: 3908
  },
  {
    name: "May",
    revenue: 1890,
    users: 4800
  },
  {
    name: "Jun",
    revenue: 2390,
    users: 3800
  },
  {
    name: "Jul",
    revenue: 3490,
    users: 4300
  },
  {
    name: "Aug",
    revenue: 4000,
    users: 2400
  },
  {
    name: "Sep",
    revenue: 3000,
    users: 1398
  },
  {
    name: "Oct",
    revenue: 2000,
    users: 9800
  },
  {
    name: "Nov",
    revenue: 2780,
    users: 3908
  },
  {
    name: "Dec",
    revenue: 1890,
    users: 4800
  }
];

export function OverviewChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={value => `$${value}`} />
        <Tooltip />
        <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Revenue" />
        <Bar dataKey="users" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Users" />
      </BarChart>
    </ResponsiveContainer>
  );
}
