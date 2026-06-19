import { useState, useEffect } from "react";
import { getAdmins, createAdmin, editAdmin, toggleAdminStatus, resetUserPassword } from "@/api/user.api";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, ShieldOff, ShieldCheck, KeyRound, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const EMPTY_FORM = { email: "", employeeId: "", name: "", designation: "", department: "", organization: "", phone: "" };

// List rows are MentorProfile docs with `userId` populated; user lifecycle routes key off the User id.
const userIdOf = (row) => row?.userId?._id || row?.userId;

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null);

  const fetchAdmins = () => {
    setLoading(true);
    getAdmins()
      .then((res) => setAdmins(res.data?.data || []))
      .catch(() => toast.error("Failed to load admins"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAdmin) {
        await editAdmin(userIdOf(editingAdmin), {
          name: form.name,
          designation: form.designation,
          department: form.department,
          organization: form.organization,
          phone: form.phone,
        });
        toast.success("Admin updated");
      } else {
        await createAdmin({
          email: form.email,
          employeeId: form.employeeId,
          name: form.name,
          designation: form.designation || undefined,
          department: form.department || undefined,
          organization: form.organization || undefined,
          phone: form.phone || undefined,
        });
        toast.success("Admin created. Login credentials emailed to them.");
      }
      setShowModal(false);
      setEditingAdmin(null);
      setForm(EMPTY_FORM);
      fetchAdmins();
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
      await toggleAdminStatus(userIdOf(toggleTarget), { status: nextStatus });
      toast.success(`Admin ${nextStatus === "BLOCKED" ? "deactivated" : "activated"}`);
      fetchAdmins();
    } catch (err) {
      toast.error("Toggle failed");
    } finally {
      setToggleTarget(null);
    }
  };

  const handleResetPassword = async (admin) => {
    try {
      await resetUserPassword(userIdOf(admin));
      toast.success("Password reset email sent");
    } catch (err) {
      toast.error("Password reset failed");
    }
  };

  const openCreate = () => {
    setEditingAdmin(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (admin) => {
    setEditingAdmin(admin);
    setForm({
      email: admin.email || "",
      employeeId: admin.employeeId || "",
      name: admin.name || "",
      designation: admin.designation || "",
      department: admin.department || "",
      organization: admin.organization || "",
      phone: admin.phone || "",
    });
    setShowModal(true);
  };

  const columns = [
    { accessorKey: "email", header: "Email", cell: ({ row }) => (
      <div><p className="font-medium">{row.original.email}</p>{row.original.name && <p className="text-xs text-[var(--muted-foreground)]">{row.original.name}</p>}</div>
    )},
    { accessorKey: "department", header: "Department", cell: ({ row }) => row.original.department || "—" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => formatDate(row.original.createdAt) },
    { id: "actions", header: "Actions", cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row.original)}><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setToggleTarget(row.original)}>
          {row.original.status === "ACTIVE" ? <ShieldOff className="h-4 w-4 text-[var(--destructive)]" /> : <ShieldCheck className="h-4 w-4 text-[var(--success)]" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleResetPassword(row.original)}><KeyRound className="h-4 w-4" /></Button>
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Management</h1>
          <p className="text-[var(--muted-foreground)]">Create and manage admin accounts</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Admin
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : (
        <DataTable columns={columns} data={admins} emptyTitle="No admins" emptyDescription="Create your first admin account." />
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-50 w-full max-w-md">
              <Card className="shadow-xl max-h-[85vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{editingAdmin ? "Edit Admin" : "Create Admin"}</CardTitle>
                  <button onClick={() => setShowModal(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"><X className="h-4 w-4" /></button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={!!editingAdmin} />
                    </div>
                    <div className="space-y-2">
                      <Label>Employee ID *</Label>
                      <Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required={!editingAdmin} disabled={!!editingAdmin} />
                    </div>
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Designation</Label><Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Organization</Label><Input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                    </div>
                    {!editingAdmin && <p className="text-xs text-[var(--muted-foreground)]">A temporary password will be generated and emailed to the admin.</p>}
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                      <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : editingAdmin ? "Update" : "Create"}</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggle}
        title={toggleTarget?.status === "ACTIVE" ? "Deactivate Admin" : "Activate Admin"}
        description={`Are you sure you want to ${toggleTarget?.status === "ACTIVE" ? "deactivate" : "activate"} ${toggleTarget?.email}?`}
        confirmText={toggleTarget?.status === "ACTIVE" ? "Deactivate" : "Activate"}
      />
    </motion.div>
  );
}
