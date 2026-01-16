import { Download } from "lucide-react";

interface TimeFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function TimeFilter({ activeFilter, onFilterChange }: TimeFilterProps) {
  const filters = ["Last Hour", "Today", "Week"];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30 backdrop-blur-sm">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${
              activeFilter === filter
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
      
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning text-warning-foreground font-medium text-sm transition-all duration-300 hover:opacity-90 hover:shadow-lg hover:shadow-warning/20">
        <Download className="w-4 h-4" />
        Export Report
      </button>
    </div>
  );
}
