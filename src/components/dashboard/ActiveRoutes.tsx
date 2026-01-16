import { useEffect, useState, useMemo } from "react";
import { freightRoutes, routeStats, FreightRoute } from "./freightRoutes";

export function ActiveRoutes() {
  const [animatedRoutes, setAnimatedRoutes] = useState<Set<string>>(new Set());
  const [hoveredRoute, setHoveredRoute] = useState<FreightRoute | null>(null);
  const [pulsePhase, setPulsePhase] = useState(0);

  // Animate route activations
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedRoutes((prev) => {
        const next = new Set(prev);
        const randomRoute = freightRoutes[Math.floor(Math.random() * freightRoutes.length)];
        next.add(randomRoute.id);
        
        // Keep only last 8 animated routes
        if (next.size > 8) {
          const firstItem = next.values().next().value;
          if (firstItem) next.delete(firstItem);
        }
        return next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Pulse animation phase
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(pulseInterval);
  }, []);

  // Calculate curved path between two points (great circle approximation)
  const getRoutePath = (fromX: number, fromY: number, toX: number, toY: number) => {
    const midX = (fromX + toX) / 2;
    // Arc height based on distance
    const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const arcHeight = Math.min(distance * 0.3, 20);
    const midY = Math.min(fromY, toY) - arcHeight;
    
    return `M ${fromX}% ${fromY}% Q ${midX}% ${midY}% ${toX}% ${toY}%`;
  };

  // Get stroke width based on volume
  const getStrokeWidth = (volume: number) => {
    return 0.5 + (volume / 10) * 2;
  };

  // Active routes for display (limit for performance)
  const displayRoutes = useMemo(() => {
    return freightRoutes.slice(0, 24);
  }, []);

  return (
    <div className="glass-card p-6 hover-lift h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary pulse-live" />
          <h3 className="text-lg font-semibold text-foreground">Global Freight Network</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
            {routeStats.totalActiveRoutes} Routes
          </span>
          <span className="px-2.5 py-1 rounded-full bg-success/20 text-success text-xs font-medium">
            Live
          </span>
        </div>
      </div>

      {/* World Map Visualization */}
      <div className="relative h-[280px] rounded-xl overflow-hidden bg-gradient-to-b from-background/40 to-background/80 border border-border/30">
        {/* Background Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Continent Outlines (simplified) */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          {/* Europe outline */}
          <ellipse cx="38%" cy="32%" rx="8%" ry="10%" fill="hsl(var(--primary))" opacity="0.3" />
          {/* Asia outline */}
          <ellipse cx="72%" cy="42%" rx="18%" ry="16%" fill="hsl(var(--primary))" opacity="0.3" />
          {/* Americas outline */}
          <ellipse cx="20%" cy="48%" rx="12%" ry="24%" fill="hsl(var(--primary))" opacity="0.3" />
          {/* Oceania outline */}
          <ellipse cx="88%" cy="72%" rx="8%" ry="8%" fill="hsl(var(--primary))" opacity="0.3" />
        </svg>

        {/* Route Arcs */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            {/* Glow filter for active routes */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Animated dash pattern */}
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {displayRoutes.map((route) => {
            const isAnimated = animatedRoutes.has(route.id);
            const isHovered = hoveredRoute?.id === route.id;
            const path = getRoutePath(
              route.origin.x,
              route.origin.y,
              route.destination.x,
              route.destination.y
            );
            const strokeWidth = getStrokeWidth(route.volume);

            return (
              <g 
                key={route.id}
                onMouseEnter={() => setHoveredRoute(route)}
                onMouseLeave={() => setHoveredRoute(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Route path */}
                <path
                  d={path}
                  fill="none"
                  stroke={isAnimated || isHovered ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                  strokeWidth={isHovered ? strokeWidth + 1 : strokeWidth}
                  strokeDasharray={isAnimated ? "none" : "4 4"}
                  opacity={isAnimated || isHovered ? 0.9 : 0.25}
                  filter={isAnimated ? "url(#glow)" : "none"}
                  className="transition-all duration-300"
                />
                
                {/* Animated pulse along route */}
                {isAnimated && (
                  <circle r="3" fill="hsl(var(--primary))" filter="url(#glow)">
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      path={path.replace(/%/g, '')}
                    >
                      <mpath href={`#path-${route.id}`} />
                    </animateMotion>
                  </circle>
                )}

                {/* Origin point */}
                <circle
                  cx={`${route.origin.x}%`}
                  cy={`${route.origin.y}%`}
                  r={isHovered ? 5 : 3}
                  fill={isAnimated || isHovered ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                  opacity={isAnimated || isHovered ? 1 : 0.4}
                  className="transition-all duration-300"
                />
                
                {/* Origin pulse ring */}
                {isAnimated && (
                  <circle
                    cx={`${route.origin.x}%`}
                    cy={`${route.origin.y}%`}
                    r="6"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1"
                    opacity="0.5"
                    className="animate-ping"
                  />
                )}

                {/* Destination point */}
                <circle
                  cx={`${route.destination.x}%`}
                  cy={`${route.destination.y}%`}
                  r={isHovered ? 5 : 3}
                  fill={isAnimated || isHovered ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))"}
                  opacity={isAnimated || isHovered ? 1 : 0.4}
                  className="transition-all duration-300"
                />

                {/* City labels on hover */}
                {isHovered && (
                  <>
                    <text
                      x={`${route.origin.x}%`}
                      y={`${route.origin.y - 3}%`}
                      textAnchor="middle"
                      className="fill-foreground text-[8px] font-medium"
                    >
                      {route.origin.name}
                    </text>
                    <text
                      x={`${route.destination.x}%`}
                      y={`${route.destination.y - 3}%`}
                      textAnchor="middle"
                      className="fill-foreground text-[8px] font-medium"
                    >
                      {route.destination.name}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Ambient glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-3xl" />
        </div>

        {/* Hover tooltip */}
        {hoveredRoute && (
          <div className="absolute bottom-4 left-4 right-4 glass-card p-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-foreground">{hoveredRoute.origin.name}</span>
                </div>
                <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-sm font-medium text-foreground">{hoveredRoute.destination.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-medium">
                  {hoveredRoute.shipments} shipments
                </span>
                <span className={`px-2 py-0.5 rounded font-medium ${
                  hoveredRoute.status === 'active' 
                    ? 'bg-success/20 text-success' 
                    : 'bg-warning/20 text-warning'
                }`}>
                  {hoveredRoute.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Origin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-xs text-muted-foreground">Destination</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">{routeStats.totalShipments.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">total shipments tracked</span>
        </div>
      </div>
    </div>
  );
}
