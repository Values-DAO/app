"use client";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { day: "M", submissions: 6, purchase: 500 },
  { day: "T", submissions: 4, purchase: 800 },
  { day: "W", submissions: 4, purchase: 1000 },
  { day: "T", submissions: 8, purchase: 1400 },
  { day: "F", submissions: 10, purchase: 1600 },
  { day: "S", submissions: 7, purchase: 1700 },
  { day: "S", submissions: 7, purchase: 1900 },
];

export function ProgressChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 40, // Increased right margin for better spacing
            left: 20, // Increased left margin
            bottom: 20, // Increased bottom margin
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={true} />

          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#666" }}
            padding={{ left: 20, right: 20 }} // Added padding to prevent cutting off labels
          />

          <YAxis
            yAxisId="left"
            width={60} // Explicit width to prevent overlapping
            domain={[0, "auto"]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#666" }}
            label={{
              value: "Submissions",
              angle: -90,
              position: "insideLeft",
              offset: 10, // Added offset to prevent overlapping
              style: { textAnchor: "middle" },
            }}
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            width={70} // Explicit width to prevent overlapping
            domain={[0, "auto"]}
            tickFormatter={(value) => `$${value}`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#666" }}
            label={{
              value: "Purchase",
              angle: 90,
              position: "insideRight",
              offset: 10, // Added offset to prevent overlapping
              style: { textAnchor: "middle" },
            }}
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

          <Line yAxisId="left" dataKey="submissions" stroke="#000" strokeWidth={2} dot={true} />

          <Line yAxisId="right" dataKey="purchase" stroke="#10B981" strokeWidth={2} dot={true} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
