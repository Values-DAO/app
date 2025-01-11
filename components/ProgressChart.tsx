import React from "react";
import { ComposedChart, Bar, XAxis, YAxis, Scatter, CartesianGrid, ResponsiveContainer, Line } from "recharts";

const data = [
  { day: "M", submissions: 6, low: 2, high: 4, open: 2, close: 4, value: [2, 4] },
  { day: "T", submissions: 5, low: 4, high: 8, open: 4, close: 7, value: [4, 7] },
  { day: "W", submissions: 4, low: 5, high: 10, open: 5, close: 9, value: [5, 9] },
  { day: "T", submissions: 7, low: 7, high: 13, open: 7, close: 12, value: [7, 12] },
  { day: "F", submissions: 10, low: 8, high: 15, open: 8, close: 14, value: [8, 14] },
  { day: "S", submissions: 6, low: 9, high: 17, open: 9, close: 16, value: [9, 16] },
  { day: "S", submissions: 6, low: 10, high: 19, open: 10, close: 18, value: [10, 18] },
];

const CustomBar = (props) => {
  const { x, y, width, height, fill } = props;

  return <rect x={x - width / 2} y={y} width={width} height={Math.max(height, 0)} fill={fill} />;
};

const CandlestickChart = () => {
  return (
    <div className="w-full h-96 bg-white p-4 rounded-lg shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" scale="point" padding={{ left: 10, right: 10 }} />
          <YAxis yAxisId="left" orientation="left" domain={[0, 20]} tickCount={5} />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 1000]}
            tickFormatter={(value) => `$${value}`}
            tickCount={5}
          />

          {/* Candlestick body */}
          {data.map((entry, index) => (
            <Bar
              key={`bar-${index}`}
              yAxisId="left"
              dataKey="value"
              shape={<CustomBar />}
              fill="#22c55e"
              stroke="#22c55e"
              barSize={10}
            />
          ))}

          {/* High-low lines */}
          <Line yAxisId="left" dataKey="high" stroke="#22c55e" dot={false} isAnimationActive={false} />
          <Line yAxisId="left" dataKey="low" stroke="#22c55e" dot={false} isAnimationActive={false} />

          {/* Scatter plot for submissions */}
          <Scatter yAxisId="left" dataKey="submissions" fill="#000000" radius={6} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CandlestickChart;
