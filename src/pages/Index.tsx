import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, XCircle, BarChart } from "lucide-react";
import { TopNav } from "@/components/dashboard/TopNav";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ProcessingChart } from "@/components/dashboard/ProcessingChart";
import { ActiveRoutes } from "@/components/dashboard/ActiveRoutes";
import { ProposalsTable } from "@/components/dashboard/ProposalsTable";
import { ClientPerformanceTable } from "@/components/dashboard/ClientPerformanceTable";
import { TimeFilter } from "@/components/dashboard/TimeFilter";
import { Inbox } from "@/components/dashboard/Inbox";
import AskMagus from "@/pages/AskMagus";
import { getStatusCounts } from "@/lib/api";

interface StatusCounts {
  auto_processed: number;
  needs_human_decision: number;
  human_confirmed_replied: number;
  human_rejected: number;
  total: number;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "inbox" | "ask-magus">("dashboard");
  const [timeFilter, setTimeFilter] = useState("Last Hour");
  const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        setLoading(true);
        const counts = await getStatusCounts();
        setStatusCounts({
          auto_processed: counts.auto_processed || 0,
          needs_human_decision: counts.needs_human_decision || 0,
          human_confirmed_replied: counts.human_confirmed_replied || 0,
          human_rejected: counts.human_rejected || 0,
          total: counts.total || 0,
        });
      } catch (error) {
        console.error("Failed to fetch status counts:", error);
        setStatusCounts({
          auto_processed: 0,
          needs_human_decision: 0,
          human_confirmed_replied: 0,
          human_rejected: 0,
          total: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "dashboard") {
      fetchStatusCounts();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="p-6 max-w-[1600px] mx-auto">
        {activeTab === "dashboard" ? (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="animate-fade-in">
                <h1 className="text-3xl font-bold text-foreground">Freight Operations</h1>
                <p className="text-muted-foreground mt-1">Real-time AI processing overview</p>
              </div>
              <TimeFilter activeFilter={timeFilter} onFilterChange={setTimeFilter} />
            </div>

            {/* Metrics Grid */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-6"
              style={{ animationDelay: "100ms" }}
            >
              <div className="animate-fade-in" style={{ animationDelay: "0ms" }}>
                <MetricCard
                  title="Auto Processed"
                  value={loading ? "..." : String(statusCounts?.auto_processed || 0)}
                  subtitle="Automatically handled"
                  subtitleType="success"
                  icon={CheckCircle}
                  iconBg="bg-success/20"
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                <MetricCard
                  title="Needs Human Decision"
                  value={loading ? "..." : String(statusCounts?.needs_human_decision || 0)}
                  subtitle="Requires attention"
                  subtitleType="warning"
                  icon={AlertCircle}
                  iconBg="bg-warning/20"
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                <MetricCard
                  title="Human Confirmed"
                  value={loading ? "..." : String(statusCounts?.human_confirmed_replied || 0)}
                  subtitle="Confirmed & replied"
                  subtitleType="success"
                  icon={CheckCircle}
                  iconBg="bg-primary/20"
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
                <MetricCard
                  title="Human Rejected"
                  value={loading ? "..." : String(statusCounts?.human_rejected || 0)}
                  subtitle="Rejected by human"
                  subtitleType="neutral"
                  icon={XCircle}
                  iconBg="bg-muted/20"
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: "400ms" }}>
                <MetricCard
                  title="Total Emails"
                  value={loading ? "..." : String(statusCounts?.total || 0)}
                  subtitle="All email records"
                  subtitleType="neutral"
                  icon={BarChart}
                  iconBg="bg-secondary/20"
                />
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
              <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
                <ProcessingChart />
              </div>
              <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "400ms" }}>
                <ActiveRoutes />
              </div>
            </div>

            {/* Proposals Table */}
            <div className="animate-fade-in mb-6" style={{ animationDelay: "500ms" }}>
              <ProposalsTable />
            </div>

            {/* Client Performance Table */}
            <div className="animate-fade-in" style={{ animationDelay: "600ms" }}>
              <ClientPerformanceTable />
            </div>
          </>
        ) : activeTab === "inbox" ? (
          <div className="animate-fade-in">
            <Inbox />
          </div>
        ) : (
          <div className="animate-fade-in">
            <AskMagus />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
