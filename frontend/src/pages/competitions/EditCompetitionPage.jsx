import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getCompetitionById, updateCompetition } from "@/api/competition.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Edit } from "lucide-react";
import { EVENT_TYPES, EVENT_MODES } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().min(3),
  organization: z.string().min(2),
  description: z.string().optional(),
  eventType: z.string().min(1),
  mode: z.string().min(1),
  registrationLink: z.string().url().optional().or(z.literal("")),
  timeline: z.object({
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    registrationDeadline: z.string().min(1),
  }),
  eligibility: z.object({
    departments: z.string().optional(),
    years: z.string().optional(),
  }).optional(),
  tags: z.string().optional(),
  rounds: z.array(z.object({ name: z.string().min(1), description: z.string().optional(), date: z.string().optional() })).optional(),
  prizes: z.array(z.object({ position: z.string().min(1), reward: z.string().optional() })).optional(),
});

function toDateInput(d) { return d ? new Date(d).toISOString().split("T")[0] : ""; }

export default function EditCompetitionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { rounds: [], prizes: [], timeline: {} },
  });

  const { fields: roundFields, append: addRound, remove: removeRound } = useFieldArray({ control, name: "rounds" });
  const { fields: prizeFields, append: addPrize, remove: removePrize } = useFieldArray({ control, name: "prizes" });

  useEffect(() => {
    getCompetitionById(id)
      .then((res) => {
        const c = res.data?.data || res.data;
        reset({
          title: c.title || "",
          organization: c.organization || "",
          description: c.description || "",
          eventType: c.eventType || "",
          mode: c.mode || "",
          registrationLink: c.registrationUrl || "",
          timeline: {
            startDate: toDateInput(c.timeline?.startDate),
            endDate: toDateInput(c.timeline?.endDate),
            registrationDeadline: toDateInput(c.timeline?.registrationDeadline),
          },
          eligibility: {
            departments: c.eligibility?.departments?.join(", ") || "",
            years: c.eligibility?.years?.join(", ") || "",
          },
          tags: c.tags?.join(", ") || "",
          rounds: (c.rounds || []).map((r) => ({ name: r.title || "", description: r.description || "", date: toDateInput(r.startDate) })),
          prizes: (c.prizes || []).map((p) => ({ position: p.title || "", reward: p.amount || "" })),
        });
      })
      .catch(() => toast.error("Failed to load competition"))
      .finally(() => setFetching(false));
  }, [id, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        title: data.title,
        organization: data.organization,
        description: data.description,
        eventType: data.eventType,
        mode: data.mode,
        registrationUrl: data.registrationLink || undefined,
        timeline: data.timeline,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        eligibility: {
          departments: data.eligibility?.departments ? data.eligibility.departments.split(",").map((d) => d.trim()).filter(Boolean) : [],
          years: data.eligibility?.years ? data.eligibility.years.split(",").map((y) => Number.parseInt(y, 10)).filter((n) => !Number.isNaN(n)) : [],
        },
        rounds: (data.rounds || []).map((r) => ({ title: r.name, description: r.description || undefined, startDate: r.date || undefined })),
        prizes: (data.prizes || []).map((p) => ({ title: p.position, amount: p.reward || undefined })),
      };
      await updateCompetition(id, payload);
      toast.success("Competition updated");
      navigate(`/competitions/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Edit className="h-6 w-6 text-[var(--primary)]" /> Edit Competition
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Title *</Label>
                <Input {...register("title")} />
                {errors.title && <p className="text-xs text-[var(--destructive)]">{errors.title.message}</p>}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Organization *</Label>
                <Input {...register("organization")} />
              </div>
              <div className="space-y-2">
                <Label>Event Type *</Label>
                <Select {...register("eventType")}>
                  <option value="">Select type</option>
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mode *</Label>
                <Select {...register("mode")}>
                  <option value="">Select mode</option>
                  {EVENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register("description")} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Registration Link</Label>
              <Input {...register("registrationLink")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label>Start Date *</Label><Input type="date" {...register("timeline.startDate")} /></div>
              <div className="space-y-2"><Label>End Date *</Label><Input type="date" {...register("timeline.endDate")} /></div>
              <div className="space-y-2"><Label>Deadline *</Label><Input type="date" {...register("timeline.registrationDeadline")} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Eligibility & Tags</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Departments</Label><Input {...register("eligibility.departments")} /></div>
            <div className="space-y-2"><Label>Years</Label><Input {...register("eligibility.years")} /></div>
            <div className="space-y-2"><Label>Tags</Label><Input {...register("tags")} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Rounds</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => addRound({ name: "", description: "", date: "" })} className="gap-1">
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {roundFields.map((field, idx) => (
              <div key={field.id} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--muted)]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white text-sm font-bold">{idx + 1}</div>
                <div className="flex-1 space-y-2">
                  <Input placeholder="Round name" {...register(`rounds.${idx}.name`)} />
                  <Input placeholder="Description" {...register(`rounds.${idx}.description`)} />
                  <Input type="date" {...register(`rounds.${idx}.date`)} />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeRound(idx)} className="h-8 w-8 text-[var(--destructive)]"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Prizes</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => addPrize({ position: "", reward: "" })} className="gap-1">
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {prizeFields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--muted)]">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input placeholder="Position" {...register(`prizes.${idx}.position`)} />
                  <Input placeholder="Reward" {...register(`prizes.${idx}.reward`)} />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removePrize(idx)} className="h-8 w-8 text-[var(--destructive)]"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/competitions/${id}`)}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
        </div>
      </form>
    </motion.div>
  );
}
