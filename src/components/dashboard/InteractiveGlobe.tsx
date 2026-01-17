
import { useEffect, useRef, useState, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { City, FreightRoute, getAllCities, freightRoutes } from './freightRoutes';

interface InteractiveGlobeProps {
    onArcClick: (route: FreightRoute) => void;
    onCityClick: (city: City) => void;
    selectedRouteId: string | null;
    selectedCityName: string | null;
    hoveredRouteId: string | null;
    setHoveredRouteId: (id: string | null) => void;
}

export function InteractiveGlobe({
    onArcClick,
    onCityClick,
    selectedRouteId,
    selectedCityName,
    hoveredRouteId,
    setHoveredRouteId
}: InteractiveGlobeProps) {
    const globeEl = useRef<GlobeMethods | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [hoveredCity, setHoveredCity] = useState<City | null>(null);

    // Resize observer to fit globe to container
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        // Initial measure
        updateDimensions();

        const observer = new ResizeObserver(() => {
            updateDimensions();
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Configure auto-rotation
    useEffect(() => {
        if (globeEl.current) {
            const controls = globeEl.current.controls();
            const shouldRotate = !selectedRouteId && !selectedCityName;
            controls.autoRotate = shouldRotate;
            controls.autoRotateSpeed = 0.5;
        }
    }, [selectedRouteId, selectedCityName]);

    const cities = useMemo(() => getAllCities(), []);

    // Styling helpers
    const getArcColor = (route: FreightRoute) => {
        const isSelected = selectedRouteId === route.id;
        const isHovered = hoveredRouteId === route.id;

        // Connected to selected city?
        const isConnectedToSelectedCity = selectedCityName && (
            route.origin.name === selectedCityName ||
            route.destination.name === selectedCityName
        );

        if (isSelected || isHovered) return "rgba(100, 200, 255, 1)";
        if (isConnectedToSelectedCity) return "rgba(100, 200, 255, 0.8)";

        // If something else is selected, fade out
        if (selectedRouteId || selectedCityName) return "rgba(255, 255, 255, 0.05)";

        return "rgba(100, 200, 255, 0.4)";
    };

    const getPointColor = (city: City) => {
        const isSelected = selectedCityName === city.name;
        const isHovered = hoveredCity?.name === city.name;

        // Part of selected route?
        const isPartOfSelectedRoute = selectedRouteId &&
            freightRoutes.find(r => r.id === selectedRouteId && (r.origin.name === city.name || r.destination.name === city.name));

        if (isSelected || isHovered || isPartOfSelectedRoute) return "#64c8ff";
        if (selectedRouteId || selectedCityName) return "rgba(255, 255, 255, 0.2)";
        return "#ffffff";
    };

    return (
        <div ref={containerRef} className="relative w-full h-full rounded-xl overflow-hidden cursor-move bg-slate-900/20">
            {dimensions.width > 0 && dimensions.height > 0 && (
                <Globe
                    ref={globeEl}
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                    backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                    width={dimensions.width}
                    height={dimensions.height}
                    backgroundColor="rgba(0,0,0,0)"

                    // Arc (Route) Layer
                    arcsData={freightRoutes}
                    arcStartLat={d => (d as FreightRoute).origin.lat}
                    arcStartLng={d => (d as FreightRoute).origin.lng}
                    arcEndLat={d => (d as FreightRoute).destination.lat}
                    arcEndLng={d => (d as FreightRoute).destination.lng}
                    arcColor={d => getArcColor(d as FreightRoute)}
                    arcDashLength={0.4}
                    arcDashGap={2}
                    arcDashInitialGap={d => (d as any).order * 1}
                    arcDashAnimateTime={2000}
                    arcStroke={d => {
                        const r = d as FreightRoute;
                        return (hoveredRouteId === r.id || selectedRouteId === r.id) ? 0.8 : 0.3;
                    }}
                    onArcHover={(arc) => {
                        if (arc) {
                            setHoveredRouteId((arc as FreightRoute).id);
                            // Pause rotation on hover
                            if (globeEl.current) globeEl.current.controls().autoRotate = false;
                        } else {
                            setHoveredRouteId(null);
                            // Resume rotation only if nothing is selected
                            if (globeEl.current && !selectedRouteId && !selectedCityName) {
                                globeEl.current.controls().autoRotate = true;
                            }
                        }
                    }}
                    onArcClick={(arc) => onArcClick(arc as FreightRoute)}

                    // Points (Cities) Layer
                    pointsData={cities}
                    pointLat="lat"
                    pointLng="lng"
                    pointColor={d => getPointColor(d as City)}
                    pointAltitude={0.01}
                    pointRadius={d => (hoveredCity?.name === (d as City).name || selectedCityName === (d as City).name) ? 0.8 : 0.4}
                    pointsMerge={true}
                    onPointHover={(city) => {
                        setHoveredCity(city as City | null);
                        if (city) {
                            if (globeEl.current) globeEl.current.controls().autoRotate = false;
                        } else {
                            if (globeEl.current && !selectedRouteId && !selectedCityName) {
                                globeEl.current.controls().autoRotate = true;
                            }
                        }
                    }}
                    onPointClick={(city) => onCityClick(city as City)}
                />
            )}

            {/* Custom Tooltip */}
            {(hoveredCity || hoveredRouteId) && !selectedRouteId && !selectedCityName && (
                <div className="absolute bottom-4 left-4 glass-card px-3 py-2 text-sm z-10 pointer-events-none">
                    {hoveredCity && (
                        <div className="text-foreground font-medium">
                            {hoveredCity.name}, <span className="text-muted-foreground">{hoveredCity.country}</span>
                        </div>
                    )}
                    {hoveredRouteId && !hoveredCity && (() => {
                        const r = freightRoutes.find(route => route.id === hoveredRouteId);
                        if (!r) return null;
                        return (
                            <div className="text-foreground">
                                <span className="font-medium">{r.origin.name}</span>
                                <span className="text-muted-foreground mx-2">→</span>
                                <span className="font-medium">{r.destination.name}</span>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {r.proposals.length} active proposals
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
