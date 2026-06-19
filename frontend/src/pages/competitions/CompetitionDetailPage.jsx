import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getCompetitionById, deleteCompetition } from "@/api/competition.api";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, FileCheck, Calendar, MapPin, Globe, Award, Users, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function CompetitionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin, isAdmin, isStudent } = useAuth();
  const [comp, setComp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getCompetitionById(id)
      .then((res) => setComp(res.data?.data || res.data))
      .catch(() => toast.error("Competition not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCompetition(id);
      toast.success("Competition deleted");
      navigate("/competitions");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  );

  if (!comp) return <p className="text-center py-12 text-[var(--muted-foreground)]">Competition not found</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{comp.title}</h1>
            <StatusBadge status={comp.status} />
          </div>
          <p className="text-[var(--muted-foreground)] mt-1">{comp.organization}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(isSuperAdmin || isAdmin) && (
            <>
              <Link to={`/competitions/${id}/edit`}>
                <Button variant="outline" className="gap-2"><Edit className="h-4 w-4" /> Edit</Button>
              </Link>
              <Link to={`/assignments/${id}`}>
                <Button variant="outline" className="gap-2"><Users className="h-4 w-4" /> Assignments</Button>
              </Link>
              <Link to={`/registrations/${id}`}>
                <Button variant="outline" className="gap-2"><Users className="h-4 w-4" /> Registrations</Button>
              </Link>
            </>
          )}
          {isSuperAdmin && comp.status === "PENDING" && (
            <Link to={`/competitions/${id}/review`}>
              <Button className="gap-2"><FileCheck className="h-4 w-4" /> Review</Button>
            </Link>
          )}
          {(isSuperAdmin || isAdmin) && (
            <Button variant="destructive" className="gap-2" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )}
          {isStudent && (
            <Link to={`/registrations/${id}`}>
              <Button className="gap-2"><Users className="h-4 w-4" /> Register</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{comp.description || "No description provided."}</p>
            </CardContent>
          </Card>

          {/* Eligibility */}
          {comp.eligibility && (
            <Card>
              <CardHeader><CardTitle>Eligibility</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {comp.eligibility.departments?.length > 0 && (
                  <div><span className="text-sm font-medium">Departments:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {comp.eligibility.departments.map((d) => <Badge key={d} variant="outline">{d}</Badge>)}
                    </div>
                  </div>
                )}
                {comp.eligibility.years?.length > 0 && (
                  <div><span className="text-sm font-medium">Years:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {comp.eligibility.years.map((y) => <Badge key={y} variant="outline">{y}</Badge>)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Rounds */}
          {comp.rounds?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Rounds</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {comp.rounds.map((round, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--muted)]">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white text-sm font-bold">{idx + 1}</div>
                      <div>
                        <p className="font-medium text-sm">{round.title || round.name}</p>
                        {round.description && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{round.description}</p>}
                        {(round.startDate || round.date) && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{formatDate(round.startDate || round.date)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{comp.eventType?.replace(/_/g, " ")}</Badge>
                <Badge variant="outline">{comp.mode}</Badge>
              </div>
              {comp.timeline && (
                <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                    <Calendar className="h-4 w-4" />
                    <span>Starts: {formatDate(comp.timeline.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                    <Calendar className="h-4 w-4" />
                    <span>Ends: {formatDate(comp.timeline.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                    <Calendar className="h-4 w-4" />
                    <span>Deadline: {formatDate(comp.timeline.registrationDeadline)}</span>
                  </div>
                </div>
              )}
              {comp.registrationUrl && (
                <a href={comp.registrationUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[var(--primary)] hover:underline pt-2 border-t border-[var(--border)]">
                  <ExternalLink className="h-4 w-4" /> Registration Link
                </a>
              )}
            </CardContent>
          </Card>

          {/* Prizes */}
          {comp.prizes?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-4 w-4 text-[var(--accent)]" /> Prizes</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {comp.prizes.map((prize, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[var(--muted)]">
                    <span className="text-sm font-medium">{prize.position || prize.title}</span>
                    <Badge variant="gold">{prize.reward || prize.amount}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {comp.tags?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {comp.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Competition"
        description="This will permanently delete this competition and all related data."
        confirmText="Delete"
        loading={deleting}
      />
    </motion.div>
  );
}
