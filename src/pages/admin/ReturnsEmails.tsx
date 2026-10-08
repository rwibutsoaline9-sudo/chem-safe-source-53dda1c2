import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Inbox, Loader2, Send, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Email = {
  id: string; to_email: string; from_email: string; subject: string; html: string;
  status: string; error: string | null; sent_at: string | null; created_at: string;
};

const VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = { draft: "secondary", sent: "outline", failed: "destructive" };

export default function ReturnsEmails() {
  // Table is newer than the generated types, so query it untyped.
  const db = supabase as unknown as { from: (t: string) => any };
  const [rows, setRows] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"draft" | "sent" | "all">("draft");
  const [sel, setSel] = useState<Email | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await db.from("returns_emails").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Could not load emails");
    setRows(data ?? []);
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const visible = rows.filter((r) => tab === "all" || (tab === "draft" ? r.status !== "sent" : r.status === "sent"));

  const save = async () => {
    if (!sel) return;
    const { error } = await db.from("returns_emails").update({ subject: sel.subject.slice(0, 300), html: sel.html.slice(0, 20000) }).eq("id", sel.id);
    if (error) return toast.error("Save failed");
    setRows((p) => p.map((r) => (r.id === sel.id ? sel : r)));
    toast.success("Draft saved");
  };

  const send = async () => {
    if (!sel) return;
    setBusy(true);
    await save();
    const { data, error } = await supabase.functions.invoke("notify-refund-decision", { body: { action: "send", email_id: sel.id } });
    setBusy(false);
    if (error) return toast.error("Send failed");
    if (data?.sent) toast.success("Email sent");
    else if (data?.reason === "email not configured") toast.info("Email service isn't connected yet — draft kept.");
    else toast.error("Send failed — see the error on the email");
    setSel(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this draft?")) return;
    await db.from("returns_emails").delete().eq("id", id);
    setSel(null);
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Inbox className="w-7 h-7 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Returns Emails</h1>
            <p className="text-sm text-muted-foreground">Every decision creates a draft here. Review and edit, then send.</p>
          </div>
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="draft">To review ({rows.filter((r) => r.status !== "sent").length})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({rows.filter((r) => r.status === "sent").length})</TabsTrigger>
            <TabsTrigger value="all">All ({rows.length})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-0 divide-y">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : visible.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">No emails here.</p>
              ) : visible.map((r) => (
                <button key={r.id} onClick={() => setSel(r)}
                  className={`w-full text-left p-4 hover:bg-muted/50 ${sel?.id === r.id ? "bg-muted" : ""}`}>
                  <div className="flex justify-between gap-2">
                    <span className="font-medium truncate">{r.subject}</span>
                    <Badge variant={VARIANT[r.status] ?? "secondary"}>{r.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">From {r.from_email} → {r.to_email}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.sent_at ? `Sent ${new Date(r.sent_at).toLocaleString()}` : `Created ${new Date(r.created_at).toLocaleString()}`}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
          {sel && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="text-xs text-muted-foreground">From {sel.from_email} → {sel.to_email}</div>
                {sel.status === "sent" ? (
                  <>
                    <h2 className="font-semibold">{sel.subject}</h2>
                    <div className="prose prose-sm max-w-none border rounded-md p-3" dangerouslySetInnerHTML={{ __html: sel.html }} />
                  </>
                ) : (
                  <>
                    <Input value={sel.subject} maxLength={300} onChange={(e) => setSel({ ...sel, subject: e.target.value })} />
                    <Textarea rows={8} value={sel.html} onChange={(e) => setSel({ ...sel, html: e.target.value })} className="font-mono text-xs" />
                    <div className="text-xs font-medium">Preview</div>
                    <div className="prose prose-sm max-w-none border rounded-md p-3" dangerouslySetInnerHTML={{ __html: sel.html }} />
                    {sel.error && <p className="text-xs text-destructive">Last error: {sel.error}</p>}
                    <div className="flex gap-2">
                      <Button onClick={send} disabled={busy}>{busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}Send</Button>
                      <Button variant="outline" onClick={save} disabled={busy}>Save draft</Button>
                      <Button variant="ghost" onClick={() => remove(sel.id)} disabled={busy}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
