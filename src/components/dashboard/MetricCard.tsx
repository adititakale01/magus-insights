import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  subtitleType?: "success" | "warning" | "neutral";
  icon: LucideIcon;
  iconBg?: string;
  showBar?: boolean;
  barProgress?: number;
}

export function MetricCard({
  title,
  value,
  subtitle,
  subtitleType = "neutral",
  icon: Icon,
  iconBg = "bg-primary/20",
  showBar = false,
  barProgress = 100,
}: MetricCardProps) {
  const subtitleColors = {
    success: "text-success",
    warning: "text-warning",
    neutral: "text-muted-foreground",
  };

  return (
    <div className="glass-card p-5 hover-lift group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div
          className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-3xl font-semibold text-foreground tracking-tight">
          {value}
        </h3>
        {subtitle && (
          <p className={`text-sm ${subtitleColors[subtitleType]}`}>
            {subtitleType === "success" && "↑ "}
            {subtitleType === "warning" && "⚠ "}
            {subtitle}
          </p>
        )}
      </div>

      {showBar && (
        <div className="h-1 rounded-full bg-muted/50 mt-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${barProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
