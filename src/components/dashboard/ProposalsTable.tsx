import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const proposals = [
    {
        id: "#PRP-8823",
        customer: {
            name: "Global Logistics Inc.",
            avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=50&h=50&fit=crop",
            initials: "GL",
        },
        route: { from: "PVG", to: "LGB" },
        status: "Quote Sent",
        statusType: "success" as const,
        value: "$4,250",
    },
    {
        id: "#PRP-8822",
        customer: {
            name: "Nexus Freight",
            avatar: "",
            initials: "NF",
        },
        route: { from: "HAM", to: "NYC" },
        status: "Processing",
        statusType: "processing" as const,
        value: "—",
    },
    {
        id: "#PRP-8821",
        customer: {
            name: "Apex Shipping",
            avatar: "",
            initials: "AS",
        },
        route: { from: "SIN", to: "DXB" },
        status: "Escalated",
        statusType: "warning" as const,
        value: "$2,100",
    },
];

export function ProposalsTable() {
    return (
        <div className="glass-card p-6 hover-lift">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Recent Proposals</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Latest quote requests processed by Magus AI
                    </p>
                </div>
                <button className="glass-button text-sm">View All</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border/50">
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">
                                Proposal ID
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">
                                Customer
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">
                                Origin / Dest
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">
                                Status
                            </th>
                            <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">
                                Value
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {proposals.map((proposal, index) => (
                            <tr
                                key={proposal.id}
                                className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors duration-200"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <td className="py-4">
                                    <span className="text-primary font-medium">{proposal.id}</span>
                                </td>
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8">
                                            {proposal.customer.avatar ? (
                                                <AvatarImage src={proposal.customer.avatar} />
                                            ) : null}
                                            <AvatarFallback className="bg-secondary/30 text-secondary text-xs">
                                                {proposal.customer.initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-foreground">{proposal.customer.name}</span>
                                    </div>
                                </td>
                                <td className="py-4">
                                    <span className="text-muted-foreground">
                                        {proposal.route.from} → {proposal.route.to}
                                    </span>
                                </td>
                                <td className="py-4">
                                    <span className={`status-badge status-${proposal.statusType}`}>
                                        {proposal.status}
                                    </span>
                                </td>
                                <td className="py-4 text-right">
                                    <span className="text-foreground font-medium">{proposal.value}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
