"use client";

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

const data = [
  { day: "M", submissions: 6, purchase: [3, 5] },
  { day: "T", submissions: 4, purchase: [4, 8] },
  { day: "W", submissions: 4, purchase: [5, 10] },
  { day: "T", submissions: 8, purchase: [8, 14] },
  { day: "F", submissions: 10, purchase: [9, 16] },
  { day: "S", submissions: 7, purchase: [10, 17] },
  { day: "S", submissions: 7, purchase: [12, 19] },
];

export function ProgressChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={true} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#666" }} />
          <YAxis yAxisId="left" domain={[0, 20]} axisLine={false} tickLine={false} tick={{ fill: "#666" }} />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 1000]}
            tickFormatter={(value) => `$${value}`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#666" }}
          />
          <Tooltip />
          <Legend
            verticalAlign="bottom"
            content={({ payload }) => (
              <div className="flex gap-4 justify-center mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-black" />
                  <span>Submissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Purchase</span>
                </div>
              </div>
            )}
          />
          <Scatter yAxisId="left" dataKey="submissions" fill="#000" line={false} />
          <Line yAxisId="right" type="monotone" dataKey="purchase" stroke="#10B981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
