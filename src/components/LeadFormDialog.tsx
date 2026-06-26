import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createLead, updateLead, SOURCES, STATUSES, type Lead } from "@/services/leads";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  source: z.string().optional().or(z.literal("")),
  status: z.enum(["new", "contacted", "converted"]),
  notes: z.string().max(2000).optional().or(z.literal("")),
  follow_up_date: z.string().optional().or(z.literal("")),
});
type FormVals = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  lead?: Lead | null;
  onSaved: () => void;
}

export function LeadFormDialog({ open, onOpenChange, lead, onSaved }: Props) {
  const isEdit = !!lead;
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<FormVals>({
      resolver: zodResolver(schema),
      defaultValues: { status: "new", source: "" },
    });

  useEffect(() => {
    if (open) {
      reset({
        name: lead?.name ?? "",
        email: lead?.email ?? "",
        phone: lead?.phone ?? "",
        company: lead?.company ?? "",
        source: lead?.source ?? "",
        status: lead?.status ?? "new",
        notes: lead?.notes ?? "",
        follow_up_date: lead?.follow_up_date ?? "",
      });
    }
  }, [open, lead, reset]);

  const onSubmit = handleSubmit(async (vals) => {
    setSaving(true);
    try {
      const payload = {
        name: vals.name,
        email: vals.email,
        phone: vals.phone || null,
        company: vals.company || null,
        source: vals.source || null,
        status: vals.status,
        notes: vals.notes || null,
        follow_up_date: vals.follow_up_date || null,
      };
      if (isEdit && lead) {
        await updateLead(lead.id, payload);
        toast.success("Lead updated");
      } else {
        await createLead(payload);
        toast.success("Lead created");
      }
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save lead");
    } finally {
      setSaving(false);
    }
  });

  const status = watch("status");
  const source = watch("source");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit lead" : "New lead"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update lead details." : "Add a new client lead to your pipeline."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-1">
            <Label>Name *</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label>Email *</Label>
            <Input type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input {...register("phone")} />
          </div>
          <div className="space-y-2">
            <Label>Company</Label>
            <Input {...register("company")} />
          </div>
          <div className="space-y-2">
            <Label>Source</Label>
            <Select value={source || ""} onValueChange={(v) => setValue("source", v)}>
              <SelectTrigger><SelectValue placeholder="Select a source" /></SelectTrigger>
              <SelectContent>
                {SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setValue("status", v as FormVals["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Follow-up date</Label>
            <Input type="date" {...register("follow_up_date")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={4} {...register("notes")} />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
