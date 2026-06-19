import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getAssignments, assignCompetition, deleteAssignment } from "@/api/assignment.api";
import { getCompetitionById } from "@/api/competition.api";
import { getAdmins, getStudents } from "@/api/user.api";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Trash2, Users, ShieldCheck, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Admin/Student list rows are profile docs with `userId` populated; assignments reference the User id.
const userIdOf = (row) => row?.userId?._id || row?.userId || row?._id;

export default function AssignmentPage() {
  const { competitionId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [competition, setCompetition] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [students, setStudents] = useState([]);
  const [mentorIds, setMentorIds] = useState([]);
  const [studentIds, setStudentIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getAssignments(competitionId).catch(() => ({ data: { data: null } })),
      getCompetitionById(competitionId),
      getAdmins().catch(() => ({ data: { data: [] } })),
      getStudents().catch(() => ({ data: { data: [] } })),
    ])
      .then(([aRes, cRes, admRes, stRes]) => {
        const a = aRes.data?.data || null;
        setAssignment(a);
        setMentorIds((a?.assignedMentors || []).map((m) => m._id || m));
        setStudentIds((a?.assignedStudents || []).map((s) => s._id || s));
        setCompetition(cRes.data?.data || cRes.data);
        setAdmins(admRes.data?.data || []);
        setStudents(stRes.data?.data || []);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [competitionId]);

  const toggle = (list, setList, id) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await assignCompetition({
        competitionId,
        assignedMentors: mentorIds,
        assignedStudents: studentIds,
      });
      toast.success("Assignments saved");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save assignments");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = async () => {
    if (!assignment?._id) { setConfirmClear(false); return; }
    try {
      await deleteAssignment(assignment._id);
      toast.success("All assignments removed");
      fetchData();
    } catch (err) {
      toast.error("Remove failed");
    } finally {
      setConfirmClear(false);
    }
  };

  const renderList = (people, selected, setSelected, emptyLabel) => (
    <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border)]">
      {people.length === 0 && <p className="text-sm text-[var(--muted-foreground)] py-4 text-center">{emptyLabel}</p>}
      {people.map((p) => {
        const id = userIdOf(p);
        return (
          <label key={id} className="flex items-center gap-3 py-2 cursor-pointer">
            <input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(selected, setSelected, id)} className="h-4 w-4 accent-[var(--primary)]" />
            <span className="text-sm">
              <span className="font-medium">{p.name || p.email}</span>
              {p.name && <span className="text-[var(--muted-foreground)]"> · {p.email}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-[var(--primary)]" /> Assignments
          </h1>
          {competition && <p className="text-[var(--muted-foreground)]">for {competition.title}</p>}
        </div>
        <div className="flex gap-2">
          {assignment?._id && (
            <Button variant="outline" onClick={() => setConfirmClear(true)} className="gap-2 text-[var(--destructive)]">
              <Trash2 className="h-4 w-4" /> Clear All
            </Button>
          )}
          <Button onClick={handleSave} disabled={submitting} className="gap-2">
            <Save className="h-4 w-4" /> {submitting ? "Saving..." : "Save Assignments"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-5 w-5 text-[var(--primary)]" /> Mentors ({mentorIds.length})
              </CardTitle>
            </CardHeader>
            <CardContent>{renderList(admins, mentorIds, setMentorIds, "No admins available")}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-5 w-5 text-[var(--primary)]" /> Students ({studentIds.length})
              </CardTitle>
            </CardHeader>
            <CardContent>{renderList(students, studentIds, setStudentIds, "No students available")}</CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog open={confirmClear} onClose={() => setConfirmClear(false)} onConfirm={handleClear}
        title="Clear All Assignments" description="This removes all mentor and student assignments for this competition." confirmText="Clear All" />
    </motion.div>
  );
}
