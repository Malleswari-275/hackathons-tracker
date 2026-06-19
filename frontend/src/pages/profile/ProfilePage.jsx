import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "@/api/axios";

export default function ProfilePage() {
  const { user, role } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/profiles/me")
      .then((res) => {
        const p = res.data?.data || {};
        setProfile(p);
        setForm({ name: p.name || "", phone: p.phone || "" });
      })
      .catch(() => toast.error("Failed to load profile"));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Only send fields with a value to avoid the "Name cannot be empty" validator
      const payload = {};
      if (form.name.trim()) payload.name = form.name.trim();
      if (form.phone.trim()) payload.phone = form.phone.trim();
      const res = await api.put("/profiles/me", payload);
      setProfile(res.data?.data || { ...profile, ...payload });
      toast.success("Profile updated");
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.name || user?.email?.split("@")[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

      {/* Avatar Card */}
      <Card>
        <CardContent className="p-6 flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary)] text-2xl font-bold text-white shrink-0">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">{displayName}</h2>
            <div className="flex items-center gap-2 mt-1 text-[var(--muted-foreground)]">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="h-4 w-4 text-[var(--primary)]" />
              <Badge variant="default">{role?.replace(/_/g, " ")}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Personal Information</CardTitle>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Name</span>
                <span className="font-medium">{profile?.name || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Email</span>
                <span className="font-medium">{profile?.email || user?.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Phone</span>
                <span className="font-medium">{profile?.phone || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Role</span>
                <span className="font-medium">{role?.replace(/_/g, " ")}</span>
              </div>
              {profile?.department && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Department</span>
                  <span className="font-medium">{profile.department}</span>
                </div>
              )}
              {profile?.year && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Year</span>
                  <span className="font-medium">{profile.year}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
