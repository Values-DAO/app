"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "./ui/skeleton";
import { useState } from "react";

interface ChartData {
  date: string;
  price: number;
  marketCap: number;
}

export function ProgressChart({ isLoading, data }: { isLoading: Boolean, data: ChartData[] }) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }
  
  const [activeMetric, setActiveMetric] = useState<"price" | "marketCap">("price");

  return (
    <Card>
      <div className="flex border-b">
        <button
          onClick={() => setActiveMetric("price")}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeMetric === "price" ? "bg-slate-100 dark:bg-slate-800" : ""
          }`}
        >
          Price in ETH
        </button>
        <button
          onClick={() => setActiveMetric("marketCap")}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeMetric === "marketCap" ? "bg-slate-100 dark:bg-slate-800" : ""
          }`}
        >
          Market Cap in ETH
        </button>
      </div>
      <CardContent className="p-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickMargin={12}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                tickFormatter={(value) => (activeMetric === "marketCap" ? value : value)}
                tickMargin={12}
                padding={{ top: 10, bottom: 10 }}
              />
              <Tooltip
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                }}
                formatter={(value: number) => [
                  activeMetric === "marketCap" ? value : value,
                  activeMetric === "marketCap" ? "Market Cap" : "Price",
                ]}
              />
              <Line type="monotone" dataKey={activeMetric} stroke="#FACC14" strokeWidth={2} dot={true} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
