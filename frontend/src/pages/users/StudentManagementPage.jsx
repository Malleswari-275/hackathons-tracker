import { useState, useEffect } from "react";
import { getStudents, createStudent, updateStudent, toggleStudentStatus, resetUserPassword } from "@/api/user.api";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, UserX, UserCheck, KeyRound, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const EMPTY_FORM = { email: "", rollNumber: "", name: "", department: "", year: "", section: "", cgpa: "", phone: "" };

// List rows are StudentProfile docs with `userId` populated; user lifecycle routes key off the User id.
const userIdOf = (row) => row?.userId?._id || row?.userId;

export default function StudentManagementPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null);

  const fetchStudents = () => {
    setLoading(true);
    getStudents()
      .then((res) => setStudents(res.data?.data || []))
      .catch(() => toast.error("Failed to load students"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const yearNum = Number.parseInt(form.year, 10);
      const cgpaNum = form.cgpa !== "" ? Number.parseFloat(form.cgpa) : undefined;
      if (editingStudent) {
        await updateStudent(userIdOf(editingStudent), {
          rollNumber: form.rollNumber,
          name: form.name,
          year: yearNum,
          department: form.department,
          section: form.section || undefined,
          cgpa: cgpaNum,
          phone: form.phone || undefined,
        });
        toast.success("Student updated");
      } else {
        await createStudent({
          email: form.email,
          rollNumber: form.rollNumber,
          name: form.name,
          year: yearNum,
          department: form.department,
          section: form.section || undefined,
          cgpa: cgpaNum,
          phone: form.phone || undefined,
        });
        toast.success("Student created. Login credentials emailed to them.");
      }
      setShowModal(false);
      setEditingStudent(null);
      setForm(EMPTY_FORM);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    const nextStatus = toggleTarget.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    try {
      await toggleStudentStatus(userIdOf(toggleTarget), { status: nextStatus });
      toast.success(`Student ${nextStatus === "BLOCKED" ? "deactivated" : "activated"}`);
      fetchStudents();
    } catch (err) {
      toast.error("Toggle failed");
    } finally {
      setToggleTarget(null);
    }
  };

  const openCreate = () => {
    setEditingStudent(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (student) => {
    setEditingStudent(student);
    setForm({
      email: student.email || "",
      rollNumber: student.rollNumber || "",
      name: student.name || "",
      department: student.department || "",
      year: student.year != null ? String(student.year) : "",
      section: student.section || "",
      cgpa: student.cgpa != null ? String(student.cgpa) : "",
      phone: student.phone || "",
    });
    setShowModal(true);
  };

  const columns = [
    { accessorKey: "email", header: "Email", cell: ({ row }) => (
      <div><p className="font-medium">{row.original.email}</p>{row.original.name && <p className="text-xs text-[var(--muted-foreground)]">{row.original.name}</p>}</div>
    )},
    { accessorKey: "rollNumber", header: "Roll No.", cell: ({ row }) => row.original.rollNumber || "—" },
    { accessorKey: "department", header: "Department", cell: ({ row }) => row.original.department || "—" },
    { accessorKey: "year", header: "Year", cell: ({ row }) => row.original.year || "—" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => formatDate(row.original.createdAt) },
    { id: "actions", header: "Actions", cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row.original)}><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setToggleTarget(row.original)}>
          {row.original.status === "ACTIVE" ? <UserX className="h-4 w-4 text-[var(--destructive)]" /> : <UserCheck className="h-4 w-4 text-[var(--success)]" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => resetUserPassword(userIdOf(row.original)).then(() => toast.success("Reset sent")).catch(() => toast.error("Failed"))}>
          <KeyRound className="h-4 w-4" />
        </Button>
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
          <p className="text-[var(--muted-foreground)]">Create and manage student accounts</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Student
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" /></div>
      ) : (
        <DataTable columns={columns} data={students} emptyTitle="No students" emptyDescription="Create your first student account." />
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-50 w-full max-w-md">
              <Card className="shadow-xl max-h-[85vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{editingStudent ? "Edit Student" : "Create Student"}</CardTitle>
                  <button onClick={() => setShowModal(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"><X className="h-4 w-4" /></button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={!!editingStudent} /></div>
                    <div className="space-y-2"><Label>Roll Number *</Label><Input value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} required /></div>
                    <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Department *</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required /></div>
                      <div className="space-y-2"><Label>Year * (1-5)</Label><Input type="number" min="1" max="5" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Section</Label><Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></div>
                      <div className="space-y-2"><Label>CGPA (0-10)</Label><Input type="number" min="0" max="10" step="0.01" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} /></div>
                    </div>
                    <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                    {!editingStudent && <p className="text-xs text-[var(--muted-foreground)]">A temporary password will be generated and emailed to the student.</p>}
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                      <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : editingStudent ? "Update" : "Create"}</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog open={!!toggleTarget} onClose={() => setToggleTarget(null)} onConfirm={handleToggle}
        title={toggleTarget?.status === "ACTIVE" ? "Deactivate Student" : "Activate Student"}
        description={`Are you sure you want to ${toggleTarget?.status === "ACTIVE" ? "deactivate" : "activate"} ${toggleTarget?.email}?`}
        confirmText={toggleTarget?.status === "ACTIVE" ? "Deactivate" : "Activate"} />
    </motion.div>
  );
}
