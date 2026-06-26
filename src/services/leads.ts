import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
export type LeadUpdate = Database["public"]["Tables"]["leads"]["Update"];
export type LeadStatus = Database["public"]["Enums"]["lead_status"];

export const STATUSES: LeadStatus[] = ["new", "contacted", "converted"];
export const SOURCES = ["Website", "Referral", "Social Media", "Email", "Cold Call", "Event", "Other"];

export interface ListParams {
  search?: string;
  status?: LeadStatus | "all";
  source?: string | "all";
  sort?: "newest" | "oldest";
  page?: number;
  pageSize?: number;
}

export async function listLeads(params: ListParams = {}) {
  const { search = "", status = "all", source = "all", sort = "newest", page = 1, pageSize = 10 } = params;
  let q = supabase.from("leads").select("*", { count: "exact" });
  if (status !== "all") q = q.eq("status", status);
  if (source !== "all") q = q.eq("source", source);
  if (search.trim()) q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  q = q.order("created_at", { ascending: sort === "oldest" });
  const from = (page - 1) * pageSize;
  q = q.range(from, from + pageSize - 1);
  const { data, count, error } = await q;
  if (error) throw error;
  return { data: data ?? [], total: count ?? 0 };
}

export async function getLead(id: string) {
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createLead(input: Omit<LeadInsert, "user_id">) {
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("leads")
    .insert({ ...input, user_id: userRes.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLead(id: string, input: LeadUpdate) {
  const { data, error } = await supabase.from("leads").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
}

export async function dashboardStats() {
  const { data, error } = await supabase.from("leads").select("status, created_at");
  if (error) throw error;
  const rows = data ?? [];
  const total = rows.length;
  const by = (s: LeadStatus) => rows.filter((r) => r.status === s).length;
  return {
    total,
    new: by("new"),
    contacted: by("contacted"),
    converted: by("converted"),
    rows,
  };
}
