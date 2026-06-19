import { Select } from "@/components/ui/select";
import { EVENT_TYPES, EVENT_MODES, COMPETITION_STATUSES } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FilterBar({ filters, onChange, onReset }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const hasFilters = Object.values(filters).some((v) => v);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={filters.status || ""} onChange={(e) => handleChange("status", e.target.value)}>
        <option value="">All Statuses</option>
        {COMPETITION_STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </Select>

      <Select value={filters.eventType || ""} onChange={(e) => handleChange("eventType", e.target.value)}>
        <option value="">All Event Types</option>
        {EVENT_TYPES.map((t) => (
          <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
        ))}
      </Select>

      <Select value={filters.mode || ""} onChange={(e) => handleChange("mode", e.target.value)}>
        <option value="">All Modes</option>
        {EVENT_MODES.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
          <X className="h-3.5 w-3.5" /> Clear
        </Button>
      )}
    </div>
  );
}
