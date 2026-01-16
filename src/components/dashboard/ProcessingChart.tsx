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
  { time: "09:00", volume: 20, speed: 35 },
  { time: "10:00", volume: 35, speed: 28 },
  { time: "11:00", volume: 45, speed: 32 },
  { time: "12:00", volume: 30, speed: 45 },
  { time: "13:00", volume: 50, speed: 38 },
  { time: "14:00", volume: 42, speed: 52 },
  { time: "15:00", volume: 58, speed: 35 },
  { time: "16:00", volume: 48, speed: 42 },
  { time: "17:00", volume: 38, speed: 48 },
];

export function ProcessingChart() {
  return (
    <div className="glass-card p-6 hover-lift">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Processing Trends</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Request volume vs. processing speed over time
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Volume</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-muted-foreground">Speed</span>
          </div>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(260, 60%, 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(260, 60%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(222, 30%, 20%)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 40%, 12%)",
                border: "1px solid hsl(222, 30%, 20%)",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
              labelStyle={{ color: "hsl(210, 40%, 98%)" }}
              itemStyle={{ color: "hsl(210, 40%, 98%)" }}
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="hsl(187, 100%, 50%)"
              strokeWidth={2}
              fill="url(#volumeGradient)"
              dot={false}
              activeDot={{ r: 6, fill: "hsl(187, 100%, 50%)", strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="speed"
              stroke="hsl(260, 60%, 50%)"
              strokeWidth={2}
              fill="url(#speedGradient)"
              dot={false}
              activeDot={{ r: 6, fill: "hsl(260, 60%, 50%)", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
