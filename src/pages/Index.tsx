import { useState } from "react";
import { Clock, Mail, AlertTriangle } from "lucide-react";
import { TopNav } from "@/components/dashboard/TopNav";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ProcessingChart } from "@/components/dashboard/ProcessingChart";
import { ActiveRoutes } from "@/components/dashboard/ActiveRoutes";
import { ProposalsTable } from "@/components/dashboard/ProposalsTable";
import { ClientPerformanceTable } from "@/components/dashboard/ClientPerformanceTable";
import { TimeFilter } from "@/components/dashboard/TimeFilter";
import { Inbox } from "@/components/dashboard/Inbox";
import AskMagus from "@/pages/AskMagus";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "inbox" | "ask-magus">("dashboard");
  const [timeFilter, setTimeFilter] = useState("Last Hour");

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
              className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6"
              style={{ animationDelay: "100ms" }}
            >
              <div className="animate-fade-in" style={{ animationDelay: "0ms" }}>
                <MetricCard
                  title="Avg Response Time"
                  value="4m 12s"
                  subtitle="12% faster vs last hour"
                  subtitleType="success"
                  icon={Clock}
                  iconBg="bg-primary/20"
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                <MetricCard
                  title="Mails Processed"
                  value="92"
                  subtitle="8 new in queue"
                  subtitleType="neutral"
                  icon={Mail}
                  iconBg="bg-secondary/20"
                  showBar
                  barProgress={85}
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                <MetricCard
                  title="Escalated Requests"
                  value="7"
                  subtitle="Requires attention"
                  subtitleType="warning"
                  icon={AlertTriangle}
                  iconBg="bg-warning/20"
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
