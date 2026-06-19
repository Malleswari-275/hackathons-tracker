import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCompetitionById, approveCompetition, rejectCompetition } from "@/api/competition.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, FileCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ReviewCompetitionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comp, setComp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCompetitionById(id)
      .then((res) => setComp(res.data?.data || res.data))
      .catch(() => toast.error("Competition not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await approveCompetition(id);
      toast.success("Competition approved");
      navigate("/competitions");
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error("Please provide a reason for rejection"); return; }
    setSubmitting(true);
    try {
      await rejectCompetition(id, { rejectionReason: rejectReason });
      toast.success("Competition rejected");
      navigate("/competitions");
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!comp) return <p className="text-center py-12 text-[var(--muted-foreground)]">Competition not found</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-[var(--primary)]" /> Review Competition
        </h1>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader><CardTitle>{comp.title}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-[var(--muted-foreground)]">Organization:</span> <span className="font-medium ml-1">{comp.organization}</span></div>
            <div><span className="text-[var(--muted-foreground)]">Type:</span> <Badge variant="outline" className="ml-1">{comp.eventType?.replace(/_/g, " ")}</Badge></div>
            <div><span className="text-[var(--muted-foreground)]">Mode:</span> <Badge variant="outline" className="ml-1">{comp.mode}</Badge></div>
            <div><span className="text-[var(--muted-foreground)]">Status:</span> <Badge variant="warning" className="ml-1">{comp.status}</Badge></div>
          </div>
          {comp.description && (
            <div className="pt-3 border-t border-[var(--border)]">
              <p className="text-sm whitespace-pre-wrap">{comp.description}</p>
            </div>
          )}
          {comp.timeline && (
            <div className="pt-3 border-t border-[var(--border)] grid grid-cols-3 gap-4 text-sm">
              <div><span className="text-[var(--muted-foreground)]">Start:</span><br/>{formatDate(comp.timeline.startDate)}</div>
              <div><span className="text-[var(--muted-foreground)]">End:</span><br/>{formatDate(comp.timeline.endDate)}</div>
              <div><span className="text-[var(--muted-foreground)]">Deadline:</span><br/>{formatDate(comp.timeline.registrationDeadline)}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Card */}
      <Card>
        <CardHeader><CardTitle>Decision</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Rejection Reason (required if rejecting)</Label>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why this competition is being rejected..." rows={3} />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleApprove} disabled={submitting} className="gap-2 flex-1 bg-[var(--success)] hover:bg-[var(--success)]/90">
              <CheckCircle className="h-4 w-4" /> Approve
            </Button>
            <Button onClick={handleReject} disabled={submitting} variant="destructive" className="gap-2 flex-1">
              <XCircle className="h-4 w-4" /> Reject
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
