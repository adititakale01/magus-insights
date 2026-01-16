import { useState, useMemo } from "react";
import { freightRoutes, getAllCities, routeStats, FreightRoute, City } from "./freightRoutes";

type SelectedItem = 
  | { type: "route"; data: FreightRoute }
  | { type: "city"; data: City; routes: FreightRoute[] }
  | null;

export function ActiveRoutes() {
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const cities = useMemo(() => getAllCities(), []);

  // Get routes connected to a city
  const getRoutesForCity = (cityName: string): FreightRoute[] => {
    return freightRoutes.filter(
      r => r.origin.name === cityName || r.destination.name === cityName
    );
  };

  // Calculate curved path using quadratic bezier
  const getRoutePath = (fromX: number, fromY: number, toX: number, toY: number) => {
    const midX = (fromX + toX) / 2;
    const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const arcHeight = Math.min(distance * 0.25, 12);
    const midY = Math.min(fromY, toY) - arcHeight;
    return `M ${fromX} ${fromY} Q ${midX} ${midY} ${toX} ${toY}`;
  };

  const handleRouteClick = (route: FreightRoute) => {
    setSelectedItem({ type: "route", data: route });
  };

  const handleCityClick = (city: City) => {
    const routes = getRoutesForCity(city.name);
    setSelectedItem({ type: "city", data: city, routes });
  };

  const isRouteHighlighted = (routeId: string) => {
    if (selectedItem?.type === "route") return selectedItem.data.id === routeId;
    if (selectedItem?.type === "city") return selectedItem.routes.some(r => r.id === routeId);
    return false;
  };

  const isCityHighlighted = (cityName: string) => {
    if (selectedItem?.type === "city") return selectedItem.data.name === cityName;
    if (selectedItem?.type === "route") {
      return selectedItem.data.origin.name === cityName || selectedItem.data.destination.name === cityName;
    }
    return false;
  };

  return (
    <div className="glass-card p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Global Freight Network</h3>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{routeStats.totalCities} Ports</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>{routeStats.totalRoutes} Routes</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>{routeStats.totalTransactions} Transactions</span>
        </div>
      </div>

      <div className="flex gap-4 h-[340px]">
        {/* World Map */}
        <div className="flex-1 relative rounded-xl overflow-hidden bg-background/60 border border-border/30">
          <svg 
            viewBox="0 0 100 50" 
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* World map background - simplified landmasses */}
            <defs>
              <linearGradient id="landGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Simplified continent shapes */}
            <g fill="url(#landGradient)" stroke="hsl(var(--border))" strokeWidth="0.1">
              {/* North America */}
              <path d="M5,12 Q8,8 15,10 Q22,12 25,18 Q28,25 22,28 Q18,30 12,28 Q6,26 5,20 Z" />
              {/* South America */}
              <path d="M20,32 Q24,30 26,35 Q28,42 24,46 Q20,48 18,44 Q16,38 20,32 Z" />
              {/* Europe */}
              <path d="M45,12 Q50,10 55,12 Q58,15 56,20 Q53,22 48,20 Q44,18 45,12 Z" />
              {/* Africa */}
              <path d="M45,24 Q52,22 56,28 Q58,36 52,42 Q46,44 42,38 Q40,30 45,24 Z" />
              {/* Asia */}
              <path d="M58,10 Q70,8 82,12 Q88,18 85,25 Q80,30 70,28 Q62,26 58,20 Q56,15 58,10 Z" />
              {/* Australia */}
              <path d="M82,36 Q88,34 92,38 Q94,42 90,45 Q85,46 82,42 Q80,39 82,36 Z" />
            </g>

            {/* Route lines */}
            {freightRoutes.map((route) => {
              const isHighlighted = isRouteHighlighted(route.id);
              const isHovered = hoveredRoute === route.id;
              const opacity = selectedItem && !isHighlighted ? 0.15 : isHovered || isHighlighted ? 1 : 0.4;

              return (
                <path
                  key={route.id}
                  d={getRoutePath(
                    route.origin.x,
                    route.origin.y,
                    route.destination.x,
                    route.destination.y
                  )}
                  fill="none"
                  stroke={isHighlighted || isHovered ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                  strokeWidth={isHighlighted || isHovered ? 0.4 : 0.2}
                  opacity={opacity}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredRoute(route.id)}
                  onMouseLeave={() => setHoveredRoute(null)}
                  onClick={() => handleRouteClick(route)}
                />
              );
            })}

            {/* City points */}
            {cities.map((city) => {
              const isHighlighted = isCityHighlighted(city.name);
              const isHovered = hoveredCity === city.name;
              const opacity = selectedItem && !isHighlighted ? 0.3 : 1;

              return (
                <g key={city.name}>
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={isHighlighted || isHovered ? 0.8 : 0.5}
                    fill={isHighlighted || isHovered ? "hsl(var(--primary))" : "hsl(var(--foreground))"}
                    opacity={opacity}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredCity(city.name)}
                    onMouseLeave={() => setHoveredCity(null)}
                    onClick={() => handleCityClick(city)}
                  />
                  {/* City label on hover */}
                  {(isHovered || isHighlighted) && (
                    <text
                      x={city.x}
                      y={city.y - 1.2}
                      textAnchor="middle"
                      className="fill-foreground text-[1.8px] font-medium pointer-events-none"
                    >
                      {city.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover tooltip for routes */}
          {hoveredRoute && !selectedItem && (
            <div className="absolute bottom-3 left-3 glass-card px-3 py-2 text-sm">
              {(() => {
                const route = freightRoutes.find(r => r.id === hoveredRoute);
                if (!route) return null;
                return (
                  <span className="text-foreground">
                    <span className="font-medium">{route.origin.name}</span>
                    <span className="text-muted-foreground mx-2">→</span>
                    <span className="font-medium">{route.destination.name}</span>
                    <span className="text-muted-foreground ml-3">
                      {route.transactions.length} transactions
                    </span>
                  </span>
                );
              })()}
            </div>
          )}
        </div>

        {/* Details Panel */}
        <div className="w-80 glass-card p-4 overflow-hidden flex flex-col">
          {selectedItem ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground">
                  {selectedItem.type === "route" ? "Route Details" : "Port Details"}
                </h4>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  ✕
                </button>
              </div>

              {selectedItem.type === "route" ? (
                <RouteDetails route={selectedItem.data} />
              ) : (
                <CityDetails city={selectedItem.data} routes={selectedItem.routes} />
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div className="text-muted-foreground">
                <p className="text-sm">Click on a route or city</p>
                <p className="text-xs mt-1">to view transaction details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RouteDetails({ route }: { route: FreightRoute }) {
  return (
    <div className="flex-1 overflow-auto">
      {/* Route header */}
      <div className="mb-4 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="font-medium text-foreground">{route.origin.name}</span>
          <span className="text-muted-foreground">{route.origin.country}</span>
        </div>
        <div className="flex items-center gap-2 text-sm mt-2">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="font-medium text-foreground">{route.destination.name}</span>
          <span className="text-muted-foreground">{route.destination.country}</span>
        </div>
      </div>

      {/* Transactions */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          Recent Transactions ({route.transactions.length})
        </p>
        {route.transactions.map((txn) => (
          <div key={txn.id} className="p-3 rounded-lg bg-background/40 border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{txn.date}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                txn.status === "Delivered" ? "bg-success/20 text-success" :
                txn.status === "In Transit" ? "bg-primary/20 text-primary" :
                "bg-muted text-muted-foreground"
              }`}>
                {txn.status}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">{txn.commodity}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{txn.weight}</span>
              <span className="font-medium text-foreground">{txn.value}</span>
            </div>
            {txn.vessel && (
              <p className="text-xs text-muted-foreground mt-1">Vessel: {txn.vessel}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CityDetails({ city, routes }: { city: City; routes: FreightRoute[] }) {
  const outbound = routes.filter(r => r.origin.name === city.name);
  const inbound = routes.filter(r => r.destination.name === city.name);

  return (
    <div className="flex-1 overflow-auto">
      {/* City header */}
      <div className="mb-4 pb-4 border-b border-border/50">
        <h5 className="font-medium text-foreground text-lg">{city.name}</h5>
        <p className="text-sm text-muted-foreground">{city.country}</p>
        <div className="flex gap-4 mt-3 text-sm">
          <div>
            <span className="text-muted-foreground">Outbound: </span>
            <span className="font-medium text-foreground">{outbound.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Inbound: </span>
            <span className="font-medium text-foreground">{inbound.length}</span>
          </div>
        </div>
      </div>

      {/* Connected routes */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          Connected Routes ({routes.length})
        </p>
        {routes.map((route) => {
          const isOutbound = route.origin.name === city.name;
          const otherCity = isOutbound ? route.destination : route.origin;
          
          return (
            <div key={route.id} className="p-3 rounded-lg bg-background/40 border border-border/30">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  isOutbound ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
                }`}>
                  {isOutbound ? "→ OUT" : "← IN"}
                </span>
                <span className="text-sm font-medium text-foreground">{otherCity.name}</span>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>{route.transactions.length} transactions</span>
                <span className="font-medium text-foreground">
                  {route.transactions.reduce((acc, t) => {
                    const val = parseInt(t.value.replace(/[$,]/g, ''));
                    return acc + val;
                  }, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
