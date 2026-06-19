import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getCompetitions } from "@/api/competition.api";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterBar } from "@/components/shared/FilterBar";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit, FileCheck, ClipboardList, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function CompetitionListPage() {
  const { role, isSuperAdmin, isAdmin } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { ...filters };
    if (search) params.search = search;
    getCompetitions(params)
      .then((res) => setCompetitions(res.data?.data?.results || []))
      .catch(() => toast.error("Failed to load competitions"))
      .finally(() => setLoading(false));
  }, [search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { accessorKey: "title", header: "Title", cell: ({ row }) => (
      <div className="max-w-[200px]">
        <p className="font-medium truncate">{row.original.title}</p>
        <p className="text-xs text-[var(--muted-foreground)] truncate">{row.original.organization}</p>
      </div>
    )},
    { accessorKey: "eventType", header: "Type", cell: ({ row }) => (
      <span className="text-sm">{row.original.eventType?.replace(/_/g, " ")}</span>
    )},
    { accessorKey: "mode", header: "Mode" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "timeline.registrationDeadline", header: "Deadline", cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.timeline?.registrationDeadline)}</span>
    )},
    { id: "actions", header: "Actions", cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Link to={`/competitions/${row.original._id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
        </Link>
        {(isSuperAdmin || isAdmin) && (
          <Link to={`/competitions/${row.original._id}/edit`}>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
          </Link>
        )}
        {isSuperAdmin && row.original.status === "PENDING" && (
          <Link to={`/competitions/${row.original._id}/review`}>
            <Button variant="ghost" size="icon" className="h-8 w-8"><FileCheck className="h-4 w-4" /></Button>
          </Link>
        )}
        {(isSuperAdmin || isAdmin) && (
          <>
            <Link to={`/assignments/${row.original._id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Users className="h-4 w-4" /></Button>
            </Link>
            <Link to={`/registrations/${row.original._id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8"><ClipboardList className="h-4 w-4" /></Button>
            </Link>
          </>
        )}
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Competitions</h1>
          <p className="text-[var(--muted-foreground)]">Browse and manage all competitions</p>
        </div>
        {(isSuperAdmin || isAdmin) && (
          <Link to="/competitions/new">
            <Button className="gap-2"><Plus className="h-4 w-4" /> Create Competition</Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar placeholder="Search competitions..." onSearch={setSearch} className="sm:w-72" />
        <FilterBar filters={filters} onChange={setFilters} onReset={() => setFilters({})} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={competitions}
          emptyTitle="No competitions found"
          emptyDescription="Try adjusting your filters or create a new competition."
        />
      )}
    </motion.div>
  );
}
