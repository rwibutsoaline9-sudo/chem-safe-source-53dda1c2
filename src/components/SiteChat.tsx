import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VISITOR_KEY = "site-chat:visitor_id";
const CONVO_KEY = "site-chat:conversation_id";
const NAME_KEY = "site-chat:visitor_name";

interface Msg {
  id: string;
  sender_type: "visitor" | "admin" | "ai";
  content: string;
  created_at: string;
}

function getVisitorId(): string {
  let v = localStorage.getItem(VISITOR_KEY);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, v);
  }
  return v;
}

async function callSiteChat<T = unknown>(payload: Record<string, unknown>): Promise<T | null> {
  const { data, error } = await supabase.functions.invoke("site-chat", { body: payload });
  if (error) {
    console.error("site-chat error", error);
    return null;
  }
  return data as T;
}

export const SiteChat = () => {
  const visitorId = useMemo(getVisitorId, []);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string>(() => localStorage.getItem(NAME_KEY) ?? "");
  const [needsName, setNeedsName] = useState<boolean>(() => !localStorage.getItem(NAME_KEY));
  const [conversationId, setConversationId] = useState<string | null>(
    () => localStorage.getItem(CONVO_KEY),
  );
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTimestampRef = useRef<string | null>(null);

  // Initial load when conversation becomes known
  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;
    (async () => {
      const res = await callSiteChat<{ messages: Msg[] }>({
        action: "list_messages",
        visitor_id: visitorId,
        conversation_id: conversationId,
      });
      if (cancelled || !res?.messages) return;
      setMessages(res.messages);
      const last = res.messages[res.messages.length - 1];
      if (last) lastTimestampRef.current = last.created_at;
    })();
    return () => {
      cancelled = true;
    };
  }, [conversationId, visitorId]);

  // Poll for new messages while chat is open (admin/AI replies)
  useEffect(() => {
    if (!open || !conversationId) return;
    let cancelled = false;

    const tick = async () => {
      const res = await callSiteChat<{ messages: Msg[] }>({
        action: "list_messages",
        visitor_id: visitorId,
        conversation_id: conversationId,
        since: lastTimestampRef.current,
      });
      if (cancelled || !res?.messages?.length) return;
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const additions = res.messages.filter((m) => !seen.has(m.id));
        if (!additions.length) return prev;
        const incomingNonVisitor = additions.some((m) => m.sender_type !== "visitor");
        if (incomingNonVisitor) setAiThinking(false);
        return [...prev, ...additions];
      });
      lastTimestampRef.current = res.messages[res.messages.length - 1].created_at;
    };

    const interval = window.setInterval(tick, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [open, conversationId, visitorId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, aiThinking, open]);

  async function ensureConversation(): Promise<string | null> {
    if (conversationId) return conversationId;
    const res = await callSiteChat<{ conversation_id?: string }>({
      action: "start",
      visitor_id: visitorId,
      visitor_name: name || null,
    });
    if (!res?.conversation_id) {
      toast.error("Could not start chat. Please try again.");
      return null;
    }
    localStorage.setItem(CONVO_KEY, res.conversation_id);
    setConversationId(res.conversation_id);
    return res.conversation_id;
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    if (needsName && !name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (needsName) {
      localStorage.setItem(NAME_KEY, name.trim());
      setNeedsName(false);
    }

    setSending(true);
    try {
      const convoId = await ensureConversation();
      if (!convoId) return;

      // Optimistic
      const tempId = `temp-${Date.now()}`;
      setMessages((p) => [
        ...p,
        { id: tempId, sender_type: "visitor", content: text, created_at: new Date().toISOString() },
      ]);
      setInput("");
      setAiThinking(true);

      const res = await callSiteChat<{ message?: Msg; ai_reply?: string | null }>({
        action: "send_message",
        visitor_id: visitorId,
        conversation_id: convoId,
        content: text,
      });

      if (!res?.message) {
        setMessages((p) => p.filter((m) => m.id !== tempId));
        setAiThinking(false);
        toast.error("Message failed to send");
        return;
      }

      // Replace temp with real visitor message; AI reply (if any) will arrive via poll
      setMessages((p) => p.map((m) => (m.id === tempId ? (res.message as Msg) : m)));
      lastTimestampRef.current = res.message.created_at;
      if (!res.ai_reply) setAiThinking(false);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Chat with us</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[380px] max-h-[75vh] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm leading-tight">Chat with us</p>
                <p className="text-xs opacity-90 leading-tight">Live support · AI assist 24/7</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="p-1 rounded hover:bg-primary-foreground/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
            {needsName && messages.length === 0 && (
              <div className="space-y-2">
                <div className="text-sm bg-muted/50 rounded-lg p-3 leading-relaxed">
                  Hi! Drop your name and we'll get started. A team member will join shortly — our AI assistant can also help right away.
                </div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="text-sm"
                />
              </div>
            )}

            {!needsName && messages.length === 0 && (
              <div className="text-sm bg-muted/50 rounded-lg p-3 leading-relaxed">
                Hi {name || "there"}! How can we help — products, quotes, SDS, shipping?
              </div>
            )}

            {messages.map((m) => {
              if (m.sender_type === "visitor") {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-3.5 py-2 text-sm whitespace-pre-wrap">
                      {m.content}
                    </div>
                  </div>
                );
              }
              return (
                <div key={m.id} className="flex justify-start">
                  <div className="max-w-[85%]">
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-muted-foreground">
                      {m.sender_type === "ai" ? (
                        <>
                          <Sparkles className="w-3 h-3" /> AI Assistant
                        </>
                      ) : (
                        <span className="font-medium text-primary">Support team</span>
                      )}
                    </div>
                    <div className="bg-muted text-foreground rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm whitespace-pre-wrap">
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {aiThinking && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> AI is typing...
              </div>
            )}
          </div>

          <div className="border-t p-2 bg-card">
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className="min-h-[40px] max-h-32 resize-none text-sm"
                disabled={sending}
              />
              <Button onClick={handleSend} disabled={!input.trim() || sending} size="icon">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
