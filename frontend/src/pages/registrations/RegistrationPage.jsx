import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getRegistrations, updateRegistration } from "@/api/registration.api";
import { getCompetitionById } from "@/api/competition.api";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function RegistrationPage() {
  const { competitionId } = useParams();
  const { isStudent, user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getRegistrations(competitionId),
      getCompetitionById(competitionId),
    ])
      .then(([rRes, cRes]) => {
        // Backend returns a single Registration doc with a `students` array.
        setRegistrations(rRes.data?.data?.students || []);
        setCompetition(cRes.data?.data || cRes.data);
      })
      .catch(() => toast.error("Failed to load registrations"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [competitionId]);

  const myEntry = registrations.find(
    (s) => (s.studentId?._id || s.studentId) === user?._id
  );
  const isRegistered = myEntry?.status === "REGISTERED";

  const handleToggleRegistration = async () => {
    setToggling(true);
    try {
      const nextStatus = isRegistered ? "NOT_REGISTERED" : "REGISTERED";
      await updateRegistration(competitionId, { status: nextStatus });
      toast.success(nextStatus === "REGISTERED" ? "Registered successfully" : "Registration withdrawn");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setToggling(false);
    }
  };

  const columns = [
    { accessorKey: "studentId", header: "Student", cell: ({ row }) => (
      <p className="font-medium">{row.original.studentId?.email || row.original.studentId || "—"}</p>
    )},
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "updatedAt", header: "Updated At", cell: ({ row }) => formatDate(row.original.updatedAt) },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-[var(--primary)]" /> Registrations
          </h1>
          {competition && <p className="text-[var(--muted-foreground)]">for {competition.title}</p>}
        </div>
        {isStudent && (
          <Button onClick={handleToggleRegistration} disabled={toggling} className="gap-2">
            {isRegistered ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            {toggling ? "Processing..." : isRegistered ? "Withdraw Registration" : "Register"}
          </Button>
        )}
      </div>

      {/* Stats */}
      {!isStudent && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-[var(--muted-foreground)]">Total</p>
              <p className="text-2xl font-bold">{registrations.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-[var(--muted-foreground)]">Registered</p>
              <p className="text-2xl font-bold text-[var(--success)]">{registrations.filter(r => r.status === "REGISTERED").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-[var(--muted-foreground)]">Not Registered</p>
              <p className="text-2xl font-bold text-[var(--muted-foreground)]">{registrations.filter(r => r.status === "NOT_REGISTERED").length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" /></div>
      ) : (
        <DataTable columns={columns} data={registrations} emptyTitle="No registrations" emptyDescription="No one has registered for this competition yet." />
      )}
    </motion.div>
  );
}
