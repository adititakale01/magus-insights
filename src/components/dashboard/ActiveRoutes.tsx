import { useEffect, useState } from "react";

const routes = [
  { from: { x: 20, y: 35 }, to: { x: 85, y: 30 } },
  { from: { x: 15, y: 45 }, to: { x: 75, y: 55 } },
  { from: { x: 50, y: 25 }, to: { x: 90, y: 45 } },
  { from: { x: 25, y: 60 }, to: { x: 70, y: 40 } },
];

export function ActiveRoutes() {
  const [animatedRoutes, setAnimatedRoutes] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedRoutes((prev) => {
        const next = [...prev];
        const randomIndex = Math.floor(Math.random() * routes.length);
        if (!next.includes(randomIndex)) {
          next.push(randomIndex);
        }
        if (next.length > 2) {
          next.shift();
        }
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-6 hover-lift h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary pulse-live" />
          <h3 className="text-lg font-semibold text-foreground">Active Routes</h3>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-success/20 text-success text-xs font-medium">
          Live
        </span>
      </div>

      {/* Globe Visualization */}
      <div className="relative h-[220px] rounded-xl overflow-hidden bg-gradient-to-b from-muted/20 to-transparent">
        {/* Grid Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          {[...Array(6)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0%"
              y1={`${(i + 1) * 15}%`}
              x2="100%"
              y2={`${(i + 1) * 15}%`}
              stroke="hsl(var(--primary))"
              strokeWidth="0.5"
            />
          ))}
          {[...Array(8)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={`${(i + 1) * 12}%`}
              y1="0%"
              x2={`${(i + 1) * 12}%`}
              y2="100%"
              stroke="hsl(var(--primary))"
              strokeWidth="0.5"
            />
          ))}
        </svg>

        {/* Route Arcs */}
        <svg className="absolute inset-0 w-full h-full">
          {routes.map((route, i) => {
            const isAnimated = animatedRoutes.includes(i);
            const midX = (route.from.x + route.to.x) / 2;
            const midY = Math.min(route.from.y, route.to.y) - 15;
            
            return (
              <g key={i}>
                <path
                  d={`M ${route.from.x}% ${route.from.y}% Q ${midX}% ${midY}% ${route.to.x}% ${route.to.y}%`}
                  fill="none"
                  stroke={isAnimated ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                  strokeWidth={isAnimated ? "2" : "1"}
                  strokeDasharray={isAnimated ? "none" : "4 4"}
                  opacity={isAnimated ? 1 : 0.3}
                  className="transition-all duration-500"
                />
                {/* Origin Point */}
                <circle
                  cx={`${route.from.x}%`}
                  cy={`${route.from.y}%`}
                  r="4"
                  fill={isAnimated ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                  className={isAnimated ? "animate-pulse" : ""}
                />
                {/* Destination Point */}
                <circle
                  cx={`${route.to.x}%`}
                  cy={`${route.to.y}%`}
                  r="4"
                  fill={isAnimated ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))"}
                  opacity={isAnimated ? 1 : 0.5}
                />
              </g>
            );
          })}
        </svg>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <span className="text-sm text-muted-foreground">24 active vessels</span>
        <span className="text-xs text-muted-foreground">Updated 2s ago</span>
      </div>
    </div>
  );
}
