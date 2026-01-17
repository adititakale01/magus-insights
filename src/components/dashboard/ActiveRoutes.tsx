import { useState, useMemo } from "react";
import { freightRoutes, getAllCities, routeStats, FreightRoute, City } from "./freightRoutes";
import { InteractiveGlobe } from "./InteractiveGlobe";

type SelectedItem =
  | { type: "route"; data: FreightRoute }
  | { type: "city"; data: City; routes: FreightRoute[] }
  | null;

export function ActiveRoutes() {
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);

  // Note: hoveredCity is managed inside InteractiveGlobe for visual effects, 
  // but we could lift it up if needed. For now Global manages its own hover tooltip logic 
  // or notifies us via a callback if we added one. 
  // The InteractiveGlobe component handles its own tooltips as per the new design.

  const cities = useMemo(() => getAllCities(), []);

  // Get routes connected to a city
  const getRoutesForCity = (cityName: string): FreightRoute[] => {
    return freightRoutes.filter(
      r => r.origin.name === cityName || r.destination.name === cityName
    );
  };

  const handleRouteClick = (route: FreightRoute) => {
    setSelectedItem({ type: "route", data: route });
  };

  const handleCityClick = (city: City) => {
    const routes = getRoutesForCity(city.name);
    setSelectedItem({ type: "city", data: city, routes });
  };

  const clearSelection = () => setSelectedItem(null);

  // Derived state for passing to Globe
  const selectedRouteId = selectedItem?.type === "route" ? selectedItem.data.id : null;
  const selectedCityName = selectedItem?.type === "city" ? selectedItem.data.name : null;

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-lg font-semibold text-foreground">Global Freight Network</h3>

        <div className="flex items-center gap-4">
          {selectedItem && (
            <button
              onClick={clearSelection}
              className="text-xs px-2 py-1 rounded-md bg-accent/20 text-accent hover:bg-accent/30 transition-colors animate-in fade-in"
            >
              Clear Selection
            </button>
          )}

          <div className="flex items-center gap-3 text-sm text-muted-foreground hidden sm:flex">
            <span>{routeStats.totalCities} Ports</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span>{routeStats.totalRoutes} Routes</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span>{routeStats.totalProposals} Proposals</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* World Map / Globe */}
        <div className="flex-1 relative rounded-xl overflow-hidden bg-background/60 border border-border/30">
          <InteractiveGlobe
            onArcClick={handleRouteClick}
            onCityClick={handleCityClick}
            selectedRouteId={selectedRouteId}
            selectedCityName={selectedCityName}
            hoveredRouteId={hoveredRoute}
            setHoveredRouteId={setHoveredRoute}
          />
        </div>

        {/* Details Panel */}
        <div className="w-80 glass-card p-4 overflow-hidden flex flex-col shrink-0">
          {selectedItem ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-4 shrink-0">
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
                <p className="text-xs mt-1">to view proposal details</p>
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
    <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
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

      {/* Proposals */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          Recent Proposals ({route.proposals.length})
        </p>
        {route.proposals.map((proposal) => (
          <div key={proposal.id} className="p-3 rounded-lg bg-background/40 border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{proposal.date}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${proposal.status === "Delivered" ? "bg-success/20 text-success" :
                proposal.status === "In Transit" ? "bg-primary/20 text-primary" :
                  "bg-muted text-muted-foreground"
                }`}>
                {proposal.status}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground">{proposal.commodity}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{proposal.weight}</span>
              <span className="font-medium text-foreground">{proposal.value}</span>
            </div>
            {proposal.vessel && (
              <p className="text-xs text-muted-foreground mt-1">Vessel: {proposal.vessel}</p>
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
    <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
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
            <div key={route.id} className="p-3 rounded-lg bg-background/40 border border-border/30 cursor-pointer hover:bg-background/60 transition-colors">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${isOutbound ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
                  }`}>
                  {isOutbound ? "→ OUT" : "← IN"}
                </span>
                <span className="text-sm font-medium text-foreground">{otherCity.name}</span>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>{route.proposals.length} proposals</span>
                <span className="font-medium text-foreground">
                  {route.proposals.reduce((acc, t) => {
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
