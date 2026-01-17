import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchAllEmails, EmailRecord } from "@/lib/api";

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
    
    // Extract company name from domain
    const domainParts = domain.split(".")[0];
    const words = domainParts.split(/[-_]/);
    const capitalized = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    return capitalized || email.split("@")[0];
}

function formatProposalId(id: string): string {
    return `#PRP-${id.substring(0, 8).toUpperCase()}`;
}

function formatStatus(status: string): { text: string; type: "success" | "processing" | "warning" } {
    const statusMap: Record<string, { text: string; type: "success" | "processing" | "warning" }> = {
        auto_processed: { text: "Auto Processed", type: "success" },
        human_confirmed_replied: { text: "Quote Sent", type: "success" },
        human_rejected: { text: "Rejected", type: "warning" },
        needs_human_decision: { text: "Needs Review", type: "processing" },
        unprocessed: { text: "Processing", type: "processing" },
    };
    
    return statusMap[status] || { text: status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()), type: "processing" };
}

function formatValue(price: number | null | undefined, currency: string | null | undefined): string {
    if (!price) return "—";
    const currencySymbol = currency === "USD" ? "$" : currency || "$";
    return `${currencySymbol}${price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatRoute(origin: string | null | undefined, destination: string | null | undefined): string {
    if (!origin && !destination) return "—";
    const originStr = origin || "—";
    const destinationStr = destination || "—";
    return `${originStr} → ${destinationStr}`;
}

export function ProposalsTable() {
    const [emails, setEmails] = useState<EmailRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEmails = async () => {
            try {
                setLoading(true);
                const allEmails = await fetchAllEmails();
                // Sort by time (most recent first) and take latest 10
                const sorted = allEmails.sort((a, b) => {
                    const timeA = new Date(a.time).getTime();
                    const timeB = new Date(b.time).getTime();
                    return timeB - timeA;
                });
                setEmails(sorted.slice(0, 10));
            } catch (error) {
                console.error("Failed to fetch emails:", error);
                setEmails([]);
            } finally {
                setLoading(false);
            }
        };

        loadEmails();
    }, []);
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
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">Loading proposals...</p>
                    </div>
                ) : emails.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">No proposals found</p>
                    </div>
                ) : (
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
                            {emails.map((email, index) => {
                                const statusInfo = formatStatus(email.status);
                                const customerName = getCustomerName(email.from);
                                const initials = getInitials(email.from);
                                
                                return (
                                    <tr
                                        key={email.id}
                                        className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors duration-200"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <td className="py-4">
                                            <span className="text-primary font-medium">{formatProposalId(email.id)}</span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback className="bg-secondary/30 text-secondary text-xs">
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-foreground">{customerName}</span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-muted-foreground">
                                                {formatRoute(email.origin_city, email.destination_city)}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className={`status-badge status-${statusInfo.type}`}>
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="text-foreground font-medium">
                                                {formatValue(email.price, email.currency)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
