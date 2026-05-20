import { useEffect, useMemo, useRef, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2, MessageCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Convo {
  id: string;
  visitor_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  status: string;
  ai_enabled: boolean;
  last_message_at: string;
  unread_admin: number;
  created_at: string;
}

interface Msg {
  id: string;
  sender_type: "visitor" | "admin" | "ai";
  content: string;
  created_at: string;
}

const AdminLiveChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Convo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = useMemo(() => conversations.find((c) => c.id === activeId) ?? null, [conversations, activeId]);

  // Load conversation list + realtime
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("last_message_at", { ascending: false })
        .limit(100);
      if (!cancelled) {
        setConversations((data ?? []) as Convo[]);
        setLoadingConvos(false);
      }
    })();

    const ch = supabase
      .channel("admin-chat-convos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_conversations" },
        (payload) => {
          setConversations((prev) => {
            if (payload.eventType === "DELETE") {
              return prev.filter((c) => c.id !== (payload.old as Convo).id);
            }
            const row = payload.new as Convo;
            const exists = prev.find((c) => c.id === row.id);
            const next = exists
              ? prev.map((c) => (c.id === row.id ? row : c))
              : [row, ...prev];
            return next.sort(
              (a, b) =>
                new Date(b.last_message_at).getTime() -
                new Date(a.last_message_at).getTime(),
            );
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, []);

  // Load messages for active conversation + realtime + clear unread
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, sender_type, content, created_at")
        .eq("conversation_id", activeId)
        .order("created_at", { ascending: true });
      if (!cancelled && data) setMessages(data as Msg[]);
      // Clear unread badge
      await supabase
        .from("chat_conversations")
        .update({ unread_admin: 0 })
        .eq("id", activeId);
    })();

    const ch = supabase
      .channel(`admin-chat-${activeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${activeId}`,
        },
        (payload) => {
          const m = payload.new as Msg;
          setMessages((prev) => (prev.find((p) => p.id === m.id) ? prev : [...prev, m]));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function handleSend() {
    const text = reply.trim();
    if (!text || !activeId || sending) return;
    setSending(true);
    try {
      const { error } = await supabase.from("chat_messages").insert({
        conversation_id: activeId,
        sender_type: "admin",
        sender_id: user?.id,
        content: text,
      });
      if (error) {
        toast.error("Failed to send: " + error.message);
        return;
      }
      // Once admin replies, disable AI auto-reply by default
      if (active?.ai_enabled) {
        await supabase
          .from("chat_conversations")
          .update({ ai_enabled: false, last_message_at: new Date().toISOString() })
          .eq("id", activeId);
      } else {
        await supabase
          .from("chat_conversations")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", activeId);
      }
      setReply("");
    } finally {
      setSending(false);
    }
  }

  async function toggleAi(v: boolean) {
    if (!activeId) return;
    await supabase.from("chat_conversations").update({ ai_enabled: v }).eq("id", activeId);
  }

  async function closeConvo() {
    if (!activeId) return;
    await supabase.from("chat_conversations").update({ status: "closed" }).eq("id", activeId);
    toast.success("Conversation closed");
  }

  async function deleteConvo() {
    if (!activeId) return;
    if (!confirm("Delete this conversation and all its messages?")) return;
    const { error } = await supabase.from("chat_conversations").delete().eq("id", activeId);
    if (error) {
      toast.error(error.message);
      return;
    }
    setActiveId(null);
    toast.success("Deleted");
  }

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-2rem)] flex">
        {/* Conversation list */}
        <aside className="w-80 border-r flex flex-col bg-card">
          <div className="p-4 border-b">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> Live Chat
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Visitor conversations · AI auto-replies when no one is on
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvos && (
              <div className="p-4 text-sm text-muted-foreground">Loading...</div>
            )}
            {!loadingConvos && conversations.length === 0 && (
              <div className="p-6 text-sm text-muted-foreground text-center">
                No conversations yet.
              </div>
            )}
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left p-3 border-b hover:bg-muted/50 transition ${
                  activeId === c.id ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate">
                    {c.visitor_name || "Anonymous visitor"}
                  </span>
                  {c.unread_admin > 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      {c.unread_admin}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(c.last_message_at), { addSuffix: true })}</span>
                  {c.status === "closed" && <span>· closed</span>}
                  {c.ai_enabled && <Sparkles className="w-3 h-3 text-primary" />}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Conversation pane */}
        <section className="flex-1 flex flex-col bg-background">
          {!active && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation to start replying
            </div>
          )}

          {active && (
            <>
              <header className="p-4 border-b bg-card flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold">
                    {active.visitor_name || "Anonymous visitor"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Visitor ID: {active.visitor_id.slice(0, 8)} ·{" "}
                    {active.status === "open" ? "Open" : "Closed"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="ai-toggle"
                      checked={active.ai_enabled}
                      onCheckedChange={toggleAi}
                    />
                    <Label htmlFor="ai-toggle" className="text-sm flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> AI auto-reply
                    </Label>
                  </div>
                  <Button size="sm" variant="outline" onClick={closeConvo}>
                    Close
                  </Button>
                  <Button size="sm" variant="ghost" onClick={deleteConvo}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </header>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-3">
                {messages.map((m) => {
                  if (m.sender_type === "visitor") {
                    return (
                      <div key={m.id} className="flex justify-start">
                        <div className="max-w-[70%]">
                          <div className="text-[11px] text-muted-foreground mb-1">
                            {active.visitor_name || "Visitor"} ·{" "}
                            {new Date(m.created_at).toLocaleTimeString()}
                          </div>
                          <div className="bg-muted text-foreground rounded-2xl rounded-bl-sm px-4 py-2 text-sm whitespace-pre-wrap">
                            {m.content}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[70%]">
                        <div className="text-[11px] text-muted-foreground mb-1 text-right flex items-center justify-end gap-1">
                          {m.sender_type === "ai" ? (
                            <>
                              <Sparkles className="w-3 h-3" /> AI
                            </>
                          ) : (
                            "You"
                          )}{" "}
                          · {new Date(m.created_at).toLocaleTimeString()}
                        </div>
                        <div
                          className={`rounded-2xl rounded-br-sm px-4 py-2 text-sm whitespace-pre-wrap ${
                            m.sender_type === "ai"
                              ? "bg-accent/30 text-foreground border border-accent/40"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 border-t bg-card">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
                    rows={1}
                    className="min-h-[44px] max-h-40 resize-none"
                  />
                  <Button onClick={handleSend} disabled={!reply.trim() || sending}>
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
                {active.ai_enabled && (
                  <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI is currently auto-replying. Sending a reply will pause it.
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminLiveChat;
