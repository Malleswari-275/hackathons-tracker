import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createCompetition } from "@/api/competition.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Trophy } from "lucide-react";
import { EVENT_TYPES, EVENT_MODES } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  organization: z.string().min(2, "Organization is required"),
  description: z.string().optional(),
  eventType: z.string().min(1, "Event type is required"),
  mode: z.string().min(1, "Mode is required"),
  registrationLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  timeline: z.object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    registrationDeadline: z.string().min(1, "Deadline is required"),
  }),
  eligibility: z.object({
    departments: z.string().optional(),
    years: z.string().optional(),
  }).optional(),
  tags: z.string().optional(),
  rounds: z.array(z.object({
    name: z.string().min(1, "Round name is required"),
    description: z.string().optional(),
    date: z.string().optional(),
  })).optional(),
  prizes: z.array(z.object({
    position: z.string().min(1, "Position is required"),
    reward: z.string().optional(),
  })).optional(),
});

export default function CreateCompetitionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      rounds: [],
      prizes: [],
      timeline: { startDate: "", endDate: "", registrationDeadline: "" },
    },
  });

  const { fields: roundFields, append: addRound, remove: removeRound } = useFieldArray({ control, name: "rounds" });
  const { fields: prizeFields, append: addPrize, remove: removePrize } = useFieldArray({ control, name: "prizes" });

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
      await createCompetition(payload);
      toast.success("Competition created successfully");
      navigate("/competitions");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create competition");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-6 w-6 text-[var(--primary)]" /> Create Competition
        </h1>
        <p className="text-[var(--muted-foreground)]">Fill in the details to create a new competition</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" {...register("title")} placeholder="Competition title" />
                {errors.title && <p className="text-xs text-[var(--destructive)]">{errors.title.message}</p>}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="organization">Organization *</Label>
                <Input id="organization" {...register("organization")} placeholder="Organizing body" />
                {errors.organization && <p className="text-xs text-[var(--destructive)]">{errors.organization.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type *</Label>
                <Select id="eventType" {...register("eventType")}>
                  <option value="">Select type</option>
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </Select>
                {errors.eventType && <p className="text-xs text-[var(--destructive)]">{errors.eventType.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mode">Mode *</Label>
                <Select id="mode" {...register("mode")}>
                  <option value="">Select mode</option>
                  {EVENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                </Select>
                {errors.mode && <p className="text-xs text-[var(--destructive)]">{errors.mode.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} placeholder="Describe the competition..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationLink">Registration Link</Label>
              <Input id="registrationLink" {...register("registrationLink")} placeholder="https://..." />
              {errors.registrationLink && <p className="text-xs text-[var(--destructive)]">{errors.registrationLink.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="date" {...register("timeline.startDate")} />
                {errors.timeline?.startDate && <p className="text-xs text-[var(--destructive)]">{errors.timeline.startDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input type="date" {...register("timeline.endDate")} />
                {errors.timeline?.endDate && <p className="text-xs text-[var(--destructive)]">{errors.timeline.endDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Registration Deadline *</Label>
                <Input type="date" {...register("timeline.registrationDeadline")} />
                {errors.timeline?.registrationDeadline && <p className="text-xs text-[var(--destructive)]">{errors.timeline.registrationDeadline.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eligibility & Tags */}
        <Card>
          <CardHeader><CardTitle>Eligibility & Tags</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Departments (comma-separated)</Label>
              <Input {...register("eligibility.departments")} placeholder="CSE, ECE, ME" />
            </div>
            <div className="space-y-2">
              <Label>Years (comma-separated)</Label>
              <Input {...register("eligibility.years")} placeholder="1st, 2nd, 3rd, 4th" />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input {...register("tags")} placeholder="AI, web, design" />
            </div>
          </CardContent>
        </Card>

        {/* Rounds */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Rounds</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => addRound({ name: "", description: "", date: "" })} className="gap-1">
              <Plus className="h-3.5 w-3.5" /> Add Round
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {roundFields.map((field, idx) => (
              <div key={field.id} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--muted)]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white text-sm font-bold">{idx + 1}</div>
                <div className="flex-1 space-y-2">
                  <Input placeholder="Round name" {...register(`rounds.${idx}.name`)} />
                  <Input placeholder="Description (optional)" {...register(`rounds.${idx}.description`)} />
                  <Input type="date" {...register(`rounds.${idx}.date`)} />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeRound(idx)} className="h-8 w-8 text-[var(--destructive)]">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {roundFields.length === 0 && <p className="text-sm text-[var(--muted-foreground)] text-center py-4">No rounds added yet</p>}
          </CardContent>
        </Card>

        {/* Prizes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Prizes</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => addPrize({ position: "", reward: "" })} className="gap-1">
              <Plus className="h-3.5 w-3.5" /> Add Prize
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {prizeFields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--muted)]">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input placeholder="Position (e.g. 1st Prize)" {...register(`prizes.${idx}.position`)} />
                  <Input placeholder="Reward (e.g. ₹10,000)" {...register(`prizes.${idx}.reward`)} />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removePrize(idx)} className="h-8 w-8 text-[var(--destructive)]">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {prizeFields.length === 0 && <p className="text-sm text-[var(--muted-foreground)] text-center py-4">No prizes added yet</p>}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/competitions")}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Competition"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
