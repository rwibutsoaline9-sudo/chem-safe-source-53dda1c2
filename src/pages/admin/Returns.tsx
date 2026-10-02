import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, X, Loader2, Search, RotateCcw, Mail, Phone, Package, Calendar } from "lucide-react";

import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type RefundRequest = Tables<"refund_requests">;
type Status = RefundRequest["status"];

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  reviewing: "Reviewing",
  approved: "Approved",
  rejected: "Rejected",
  refunded: "Refunded",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  new: "default",
  reviewing: "secondary",
  approved: "outline",
  rejected: "destructive",
  refunded: "outline",
};

const RESOLUTION_LABEL: Record<string, string> = {
  refund: "Refund",
  replacement: "Replacement",
  credit: "Account credit",
  other: "Other",
};

export default function AdminReturns() {
  const [rows, setRows] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"open" | "all" | "approved" | "rejected">("open");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("refund_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Could not load refund requests");
    setRows(data ?? []);
    setNotes(Object.fromEntries((data ?? []).map((r) => [r.id, r.admin_notes ?? ""])));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (row: RefundRequest, status: Status) => {
    setBusyId(row.id);
    const admin_notes = (notes[row.id] ?? "").trim().slice(0, 2000) || null;
    const { error } = await supabase
      .from("refund_requests")
      .update({ status, admin_notes })
      .eq("id", row.id);
    setBusyId(null);
    if (error) {
      toast.error("Update failed");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status, admin_notes } : r)));
    toast.success(`Request ${STATUS_LABEL[status].toLowerCase()}`);
  };

  const counts = useMemo(
    () => ({
      open: rows.filter((r) => r.status === "new" || r.status === "reviewing").length,
      approved: rows.filter((r) => r.status === "approved" || r.status === "refunded").length,
      rejected: rows.filter((r) => r.status === "rejected").length,
      all: rows.length,
    }),
    [rows],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "open" && !(r.status === "new" || r.status === "reviewing")) return false;
      if (filter === "approved" && !(r.status === "approved" || r.status === "refunded")) return false;
      if (filter === "rejected" && r.status !== "rejected") return false;
      if (!q) return true;
      return [r.order_reference, r.customer_name, r.email, r.product_name, r.reason]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, filter, search]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-7 h-7 text-primary" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Returns &amp; Refunds</h1>
              <p className="text-sm text-muted-foreground">
                Requests submitted from the public Returns page.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Refresh
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="open">Open ({counts.open})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
              <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search order, name, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : visible.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No refund requests here yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {visible.map((r) => {
              const decided = r.status === "approved" || r.status === "rejected" || r.status === "refunded";
              return (
                <Card key={r.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">
                          {r.customer_name} · <span className="font-mono">{r.order_reference}</span>
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted {new Date(r.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={STATUS_VARIANT[r.status] ?? "secondary"}>
                        {STATUS_LABEL[r.status] ?? r.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a className="text-primary hover:underline" href={`mailto:${r.email}`}>{r.email}</a>
                      </div>
                      {r.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {r.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        {r.product_name}
                        {r.quantity ? ` — ${r.quantity}` : ""}
                      </div>
                      {r.purchase_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {r.purchase_date}
                        </div>
                      )}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Reason:</span> {r.reason}
                      <span className="text-muted-foreground"> · Wants: {RESOLUTION_LABEL[r.preferred_resolution] ?? r.preferred_resolution}</span>
                    </div>
                    {r.details && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-md p-3">
                        {r.details}
                      </p>
                    )}
                    <Textarea
                      rows={2}
                      maxLength={2000}
                      placeholder="Internal note (optional) — saved with your decision"
                      value={notes[r.id] ?? ""}
                      onChange={(e) => setNotes((p) => ({ ...p, [r.id]: e.target.value }))}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => updateStatus(r, "approved")} disabled={busyId === r.id || r.status === "approved"}>
                        {busyId === r.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => updateStatus(r, "rejected")} disabled={busyId === r.id || r.status === "rejected"}>
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      {r.status === "new" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(r, "reviewing")} disabled={busyId === r.id}>
                          Mark reviewing
                        </Button>
                      )}
                      {r.status === "approved" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(r, "refunded")} disabled={busyId === r.id}>
                          Mark refunded
                        </Button>
                      )}
                      {decided && (
                        <Button size="sm" variant="ghost" onClick={() => updateStatus(r, "reviewing")} disabled={busyId === r.id}>
                          Reopen
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
