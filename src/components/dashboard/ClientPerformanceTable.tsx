import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSenderStats, getRouteStats } from "@/lib/api";

function getInitials(email: string): string {
    const parts = email.split("@")[0].split(/[._-]/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
}

function getCustomerName(email: string): string {
    const domain = email.split("@")[1];
    if (!domain) return email;
    
    const domainParts = domain.split(".")[0];
    const words = domainParts.split(/[-_]/);
    const capitalized = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    return capitalized || email.split("@")[0];
}

function formatRoute(route: string): string {
    // Format route like "sea: Ningbo -> Felixstowe" or "air: San Francisco -> Frankfurt"
    const parts = route.split(": ");
    if (parts.length === 2) {
        const [mode, path] = parts;
        const modeUpper = mode.charAt(0).toUpperCase() + mode.slice(1);
        return `${modeUpper}: ${path}`;
    }
    return route;
}

export function ClientPerformanceTable() {
    const [senderStats, setSenderStats] = useState<{ sender: string; count: number }[]>([]);
    const [routeStats, setRouteStats] = useState<{ route: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [senderData, routeData] = await Promise.all([
                    getSenderStats(),
                    getRouteStats(),
                ]);
                setSenderStats(senderData.items);
                setRouteStats(routeData.items);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                setSenderStats([]);
                setRouteStats([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const clientData = useMemo(() => {
        return senderStats
            .map(stat => ({
                email: stat.sender,
                name: getCustomerName(stat.sender),
                initials: getInitials(stat.sender),
                requests: stat.count,
            }))
            .sort((a, b) => b.requests - a.requests)
            .slice(0, 10); // Top 10 clients
    }, [senderStats]);

    const routesData = useMemo(() => {
        return routeStats
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10 routes
    }, [routeStats]);
    return (
        <div className="glass-card p-6 hover-lift">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Client Performance</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Top performing accounts this week
                    </p>
                </div>
                <button className="glass-button text-sm">View All</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Clients Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-muted-foreground">Loading client data...</p>
                        </div>
                    ) : clientData.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-muted-foreground">No client data available</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pl-2">
                                        Client
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-2">
                                        Requests
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientData.map((client, index) => (
                                    <tr
                                        key={client.email}
                                        className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors duration-200"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <td className="py-4 pl-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback className="bg-secondary/30 text-secondary text-xs">
                                                        {client.initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-foreground font-medium">{client.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-right pr-2">
                                            <span className="text-muted-foreground">{client.requests}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Routes Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-muted-foreground">Loading routes data...</p>
                        </div>
                    ) : routesData.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-muted-foreground">No routes data available</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pl-2">
                                        Route
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-2">
                                        Count
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {routesData.map((route, index) => (
                                    <tr
                                        key={route.route}
                                        className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors duration-200"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <td className="py-4 pl-2">
                                            <span className="text-foreground">{formatRoute(route.route)}</span>
                                        </td>
                                        <td className="py-4 text-right pr-2">
                                            <span className="text-muted-foreground">{route.count}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
