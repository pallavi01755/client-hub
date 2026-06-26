import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Pencil, Trash2, Mail, Phone, Building2, Calendar, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LeadFormDialog } from "@/components/LeadFormDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { deleteLead, getLead } from "@/services/leads";

export const Route = createFileRoute("/_app/leads/$id")({
  head: () => ({
    meta: [{ title: "Lead — LeadFlow" }],
  }),
  component: LeadDetailPage,
});

function LeadDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLead(id),
  });

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  }
  if (!lead) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Lead not found.</p>
        <Button asChild variant="link"><Link to="/leads">Back to leads</Link></Button>
      </div>
    );
  }

  const onDelete = async () => {
    try {
      await deleteLead(lead.id);
      toast.success("Lead deleted");
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      navigate({ to: "/leads" });
    } catch (e: any) {
      toast.error(e.message ?? "Delete failed");
    }
  };

  const Item = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-0.5 truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon"><Link to="/leads"><ArrowLeft className="size-4" /></Link></Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{lead.name}</h2>
              <StatusBadge status={lead.status} />
            </div>
            <p className="text-sm text-muted-foreground">{lead.company || "No company"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="mr-2 size-4" />Edit</Button>
          <Button variant="outline" onClick={() => setDeleting(true)} className="text-destructive hover:text-destructive">
            <Trash2 className="mr-2 size-4" />Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Item icon={Mail} label="Email" value={lead.email} />
        <Item icon={Phone} label="Phone" value={lead.phone || "—"} />
        <Item icon={Building2} label="Company" value={lead.company || "—"} />
        <Item icon={Tag} label="Source" value={lead.source || "—"} />
        <Item icon={Calendar} label="Follow-up" value={lead.follow_up_date ? new Date(lead.follow_up_date).toLocaleDateString() : "—"} />
        <Item icon={Calendar} label="Created" value={new Date(lead.created_at).toLocaleString()} />
      </div>

      <Card>
        <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {lead.notes || "No notes yet."}
          </p>
        </CardContent>
      </Card>

      <LeadFormDialog
        open={editing}
        onOpenChange={setEditing}
        lead={lead}
        onSaved={() => qc.invalidateQueries({ queryKey: ["lead", id] })}
      />

      <AlertDialog open={deleting} onOpenChange={setDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
