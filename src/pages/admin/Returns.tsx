import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, X, Loader2, Search, RotateCcw, ExternalLink, CreditCard, ChevronDown, ChevronRight } from "lucide-react";

import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type RefundRequest = Tables<"refund_requests">;
type Status = RefundRequest["status"];
type OrderLite = { id: string; payment_intent_id: string | null; status: string; total_amount: number; currency: string };

const STATUS_LABEL: Record<string, string> = { new: "New", reviewing: "Reviewing", approved: "Approved", rejected: "Rejected", refunded: "Refunded" };
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  new: "default", reviewing: "secondary", approved: "outline", rejected: "destructive", refunded: "outline",
};
const RESOLUTION_LABEL: Record<string, string> = { refund: "Refund", replacement: "Replacement", credit: "Account credit", other: "Other" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function AdminReturns() {
  const [rows, setRows] = useState<RefundRequest[]>([]);
  const [orders, setOrders] = useState<Record<string, OrderLite>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"open" | "all" | "approved" | "rejected">("open");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("refund_requests").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Could not load refund requests");
    const list = data ?? [];
    setRows(list);
    setNotes(Object.fromEntries(list.map((r) => [r.id, r.admin_notes ?? ""])));
    const refs = [...new Set(list.map((r) => r.order_reference.trim()).filter((x) => UUID.test(x)))];
    if (refs.length) {
      const { data: o } = await supabase.from("orders").select("id,payment_intent_id,status,total_amount,currency").in("id", refs);
      setOrders(Object.fromEntries((o ?? []).map((x) => [x.id, x as OrderLite])));
    } else setOrders({});
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const notify = async (id: string) => {
    const { data, error } = await supabase.functions.invoke("notify-refund-decision", { body: { request_id: id } });
    if (error) return toast.warning("Status saved, but the email draft could not be created");
    if (data?.drafted) toast.success("Email draft created — review it in Returns Emails");
  };

  const updateStatus = async (row: RefundRequest, status: Status) => {
    setBusyId(row.id);
    const admin_notes = (notes[row.id] ?? "").trim().slice(0, 2000) || null;
    const { error } = await supabase.from("refund_requests").update({ status, admin_notes }).eq("id", row.id);
    if (error) { setBusyId(null); return toast.error("Update failed"); }
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status, admin_notes } : r)));
    toast.success(`Request ${STATUS_LABEL[status].toLowerCase()}`);
    await notify(row.id);
    setBusyId(null);
  };

  const issueRefund = async (row: RefundRequest, order: OrderLite) => {
    if (!confirm(`Refund ${order.total_amount} ${order.currency.toUpperCase()} to the customer's card via Stripe?`)) return;
    setBusyId(row.id);
    const { data, error } = await supabase.functions.invoke("process-refund", { body: { order_id: order.id } });
    if (error || data?.error) { setBusyId(null); return toast.error(data?.error ?? "Stripe refund failed"); }
    setOrders((p) => ({ ...p, [order.id]: { ...order, status: "refunded" } }));
    setBusyId(null);
    await updateStatus(row, "refunded");
  };

  const counts = useMemo(() => ({
    open: rows.filter((r) => r.status === "new" || r.status === "reviewing").length,
    approved: rows.filter((r) => r.status === "approved" || r.status === "refunded").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    all: rows.length,
  }), [rows]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "open" && !(r.status === "new" || r.status === "reviewing")) return false;
      if (filter === "approved" && !(r.status === "approved" || r.status === "refunded")) return false;
      if (filter === "rejected" && r.status !== "rejected") return false;
      return !q || [r.order_reference, r.customer_name, r.email, r.product_name, r.reason].join(" ").toLowerCase().includes(q);
    });
  }, [rows, filter, search]);

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-7 h-7 text-primary" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Returns &amp; Refunds</h1>
              <p className="text-sm text-muted-foreground">Decisions email the customer automatically.</p>
            </div>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Refresh
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
            <Input className="pl-9" placeholder="Search order, name, email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : visible.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">No refund requests here yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Submitted</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Wants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Refund payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((r) => {
                    const order = orders[r.order_reference.trim()];
                    const decided = ["approved", "rejected", "refunded"].includes(r.status);
                    const open = openId === r.id;
                    const busy = busyId === r.id;
                    return (
                      <Fragment key={r.id}>
                        <TableRow className="cursor-pointer" onClick={() => setOpenId(open ? null : r.id)}>
                          <TableCell>{open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</TableCell>
                          <TableCell className="text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="font-medium">{r.customer_name}</div>
                            <div className="text-xs text-muted-foreground">{r.email}</div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{r.order_reference}</TableCell>
                          <TableCell>{r.product_name}{r.quantity ? ` — ${r.quantity}` : ""}</TableCell>
                          <TableCell>{RESOLUTION_LABEL[r.preferred_resolution] ?? r.preferred_resolution}</TableCell>
                          <TableCell>
                            <Badge variant={STATUS_VARIANT[r.status] ?? "secondary"}>{STATUS_LABEL[r.status] ?? r.status}</Badge>
                            {r.admin_notes && <div className="text-xs text-muted-foreground mt-1 max-w-[180px] truncate" title={r.admin_notes}>Note: {r.admin_notes}</div>}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            {!order ? (
                              <span className="text-xs text-muted-foreground">No matching paid order</span>
                            ) : order.status === "refunded" ? (
                              <Badge variant="outline">Refunded</Badge>
                            ) : (
                              <div className="flex flex-col gap-1">
                                {r.status === "approved" && order.payment_intent_id && (
                                  <Button size="sm" onClick={() => issueRefund(r, order)} disabled={busy}>
                                    <CreditCard className="w-4 h-4 mr-1" />Refund {order.total_amount} {order.currency.toUpperCase()}
                                  </Button>
                                )}
                                {order.payment_intent_id && (
                                  <a className="text-xs text-primary hover:underline inline-flex items-center gap-1" target="_blank" rel="noreferrer"
                                    href={`https://dashboard.stripe.com/payments/${order.payment_intent_id}`}>
                                    View in Stripe <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                        {open && (
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableCell />
                            <TableCell colSpan={7} className="space-y-3 py-4">
                              <div className="text-sm"><span className="font-medium">Reason:</span> {r.reason}
                                {r.phone && <span className="text-muted-foreground"> · Phone: {r.phone}</span>}
                                {r.purchase_date && <span className="text-muted-foreground"> · Purchased: {r.purchase_date}</span>}
                              </div>
                              {r.details && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{r.details}</p>}
                              <Textarea rows={2} maxLength={2000} placeholder="Refund note — saved with your decision and included in the customer email"
                                value={notes[r.id] ?? ""} onChange={(e) => setNotes((p) => ({ ...p, [r.id]: e.target.value }))} />
                              <div className="flex flex-wrap gap-2">
                                <Button size="sm" onClick={() => updateStatus(r, "approved")} disabled={busy || r.status === "approved"}>
                                  {busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => updateStatus(r, "rejected")} disabled={busy || r.status === "rejected"}>
                                  <X className="w-4 h-4 mr-1" />Reject
                                </Button>
                                {r.status === "new" && <Button size="sm" variant="outline" onClick={() => updateStatus(r, "reviewing")} disabled={busy}>Mark reviewing</Button>}
                                {r.status === "approved" && <Button size="sm" variant="outline" onClick={() => updateStatus(r, "refunded")} disabled={busy}>Mark refunded (manual)</Button>}
                                {decided && <Button size="sm" variant="ghost" onClick={() => updateStatus(r, "reviewing")} disabled={busy}>Reopen</Button>}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
