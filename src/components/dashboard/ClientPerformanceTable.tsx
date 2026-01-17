import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const clients = [
    {
        name: "Global Logistics Inc.",
        initials: "GL",
        avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=50&h=50&fit=crop",
        requests: 124,
        autoPct: 82,
        avgTime: "3m 10s",
        escalationPct: 4,
        sopWeight: "High",
        sopColor: "bg-red-500/10 text-red-500",
    },
    {
        name: "Nexus Freight",
        initials: "NF",
        avatar: "",
        requests: 98,
        autoPct: 65,
        avgTime: "5m 45s",
        escalationPct: 12,
        sopWeight: "Med",
        sopColor: "bg-yellow-500/10 text-yellow-500",
    },
    {
        name: "Apex Shipping",
        initials: "AS",
        avatar: "",
        requests: 76,
        autoPct: 94,
        avgTime: "1m 20s",
        escalationPct: 2,
        sopWeight: "Low",
        sopColor: "bg-green-500/10 text-green-500",
    },
    {
        name: "Horizon Cargo",
        initials: "HC",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop",
        requests: 54,
        autoPct: 45,
        avgTime: "8m 15s",
        escalationPct: 24,
        sopWeight: "High",
        sopColor: "bg-red-500/10 text-red-500",
    },
    {
        name: "Swift Transport",
        initials: "ST",
        avatar: "",
        requests: 42,
        autoPct: 78,
        avgTime: "4m 05s",
        escalationPct: 8,
        sopWeight: "Med",
        sopColor: "bg-yellow-500/10 text-yellow-500",
    },
];

export function ClientPerformanceTable() {
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

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border/50">
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pl-2">
                                Client
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">
                                Requests
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 w-1/4">
                                Auto-Quoted
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">
                                Avg Time
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">
                                Escalation %
                            </th>
                            <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 pr-2">
                                SOP Weight
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((client, index) => (
                            <tr
                                key={client.name}
                                className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors duration-200"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <td className="py-4 pl-2">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8">
                                            {client.avatar ? (
                                                <AvatarImage src={client.avatar} />
                                            ) : null}
                                            <AvatarFallback className="bg-secondary/30 text-secondary text-xs">
                                                {client.initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-foreground font-medium">{client.name}</span>
                                    </div>
                                </td>
                                <td className="py-4">
                                    <span className="text-muted-foreground">{client.requests}</span>
                                </td>
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-1 rounded-full bg-muted/50 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                                                style={{ width: `${client.autoPct}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-muted-foreground w-8">
                                            {client.autoPct}%
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4">
                                    <span className="text-muted-foreground font-mono text-xs bg-muted/30 px-2 py-1 rounded">
                                        {client.avgTime}
                                    </span>
                                </td>
                                <td className="py-4">
                                    <span
                                        className={
                                            client.escalationPct > 20
                                                ? "text-warning font-medium"
                                                : "text-muted-foreground"
                                        }
                                    >
                                        {client.escalationPct}%
                                    </span>
                                </td>
                                <td className="py-4 text-right pr-2">
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${client.sopColor}`}
                                    >
                                        {client.sopWeight}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
