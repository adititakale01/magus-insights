import { useState, useEffect, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAllEmails, EmailRecord } from "@/lib/api";

type TimePeriod = "hour" | "day" | "week";

interface ChartDataPoint {
  time: string;
  reviewed: number;
  processed: number;
}

function groupEmailsByPeriod(
  emails: EmailRecord[],
  period: TimePeriod
): ChartDataPoint[] {
  const grouped = new Map<string, { reviewed: number; processed: number; sortKey: number }>();

  emails.forEach((email) => {
    const date = new Date(email.time);
    let key: string;
    let sortKey: number;

    if (period === "hour") {
      // Group by hour: "HH:00"
      const hour = date.getHours();
      key = `${String(hour).padStart(2, "0")}:00`;
      sortKey = hour;
    } else if (period === "day") {
      // Group by day: "MMM DD"
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      key = dayStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      sortKey = dayStart.getTime();
    } else {
      // Group by week: "Week of MMM DD"
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      key = `Week of ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      sortKey = weekStart.getTime();
    }

    if (!grouped.has(key)) {
      grouped.set(key, { reviewed: 0, processed: 0, sortKey });
    }

    const counts = grouped.get(key)!;

    // Count reviewed emails (human_confirmed_replied + human_rejected)
    if (
      email.status === "human_confirmed_replied" ||
      email.status === "human_rejected"
    ) {
      counts.reviewed++;
    }

    // Count processed emails (auto_processed + human_confirmed_replied)
    if (
      email.status === "auto_processed" ||
      email.status === "human_confirmed_replied"
    ) {
      counts.processed++;
    }
  });

  // Convert to array and sort by sortKey
  const result: ChartDataPoint[] = Array.from(grouped.entries())
    .map(([time, counts]) => ({
      time,
      reviewed: counts.reviewed,
      processed: counts.processed,
      sortKey: counts.sortKey,
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ sortKey: _, ...rest }) => rest); // Remove sortKey from final result

  return result;
}

export function ProcessingChart() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("hour");
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmails = async () => {
      try {
        setLoading(true);
        const allEmails = await fetchAllEmails();
        setEmails(allEmails);
      } catch (error) {
        console.error("Failed to fetch emails:", error);
        setEmails([]);
      } finally {
        setLoading(false);
      }
    };

    loadEmails();
  }, []);

  const chartData = useMemo(() => {
    if (emails.length === 0) return [];
    return groupEmailsByPeriod(emails, timePeriod);
  }, [emails, timePeriod]);

  return (
    <div className="glass-card p-6 hover-lift">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Processing Trends</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Mails reviewed and processed over time
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Processed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-muted-foreground">Reviewed</span>
          </div>
        </div>
      </div>

      <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)} className="mb-4">
        <TabsList>
          <TabsTrigger value="hour">Hour</TabsTrigger>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="h-[280px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="processedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(187, 100%, 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="reviewedGradient" x1="0" y1="0" x2="0" y2="1">
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
                angle={timePeriod === "day" || timePeriod === "week" ? -45 : 0}
                textAnchor={timePeriod === "day" || timePeriod === "week" ? "end" : "middle"}
                height={timePeriod === "day" || timePeriod === "week" ? 60 : 30}
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
                dataKey="processed"
                stroke="hsl(187, 100%, 50%)"
                strokeWidth={2}
                fill="url(#processedGradient)"
                dot={false}
                activeDot={{ r: 6, fill: "hsl(187, 100%, 50%)", strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="reviewed"
                stroke="hsl(260, 60%, 50%)"
                strokeWidth={2}
                fill="url(#reviewedGradient)"
                dot={false}
                activeDot={{ r: 6, fill: "hsl(260, 60%, 50%)", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
