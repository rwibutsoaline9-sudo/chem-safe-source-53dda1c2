import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageSquare, X, Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { RegionContent } from "@/data/regions";

const SUPABASE_URL = "https://lriwodanoclewwjrsimi.supabase.co";
const FN_URL = `${SUPABASE_URL}/functions/v1/region-chat`;

const COMPLIANCE_BY_REGION: Record<string, string> = {
  europe: "REACH (EC 1907/2006), CLP (EC 1272/2008), ADR/RID/IMDG transport, exposure scenarios",
  "middle-east": "GSO 2423 (GHS), SASO/SABER, ECAS, GCC Conformity, ADR/IMDG",
  asia: "China MEE/IECSC, India BIS, Thailand HSA, Malaysia EHSNR, Indonesia SIRS, GHS/MSDS",
  africa: "Nigeria SONCAP, Kenya/Tanzania PVoC, COMESA/SADC harmonized GHS labelling",
  "latin-america": "Mexico NOM-018-STPS (SGA), Brazil ANVISA/IBAMA, Chile SAG, Mercosur GHS",
};

const LANG_NAME: Record<string, string> = {
  de: "German (Deutsch)",
  ar: "Arabic (العربية)",
  "zh-CN": "Simplified Chinese (简体中文)",
  fr: "French (Français)",
  es: "Latin American Spanish (Español)",
};

const UI: Record<
  string,
  { open: string; title: string; greeting: string; placeholder: string; quote: string; thinking: string; clear: string }
> = {
  de: {
    open: "AI-Assistent öffnen",
    title: "AI-Assistent",
    greeting: "Hallo! Ich beantworte Fragen zu Compliance, Produkten und Versand in Europa. Wie kann ich helfen?",
    placeholder: "Stellen Sie eine Frage...",
    quote: "Angebot anfordern",
    thinking: "Denke nach...",
    clear: "Chat löschen",
  },
  ar: {
    open: "فتح المساعد الذكي",
    title: "المساعد الذكي",
    greeting: "مرحباً! أجيب عن أسئلتك حول الامتثال والمنتجات والشحن في الشرق الأوسط. كيف يمكنني المساعدة؟",
    placeholder: "اطرح سؤالاً...",
    quote: "اطلب عرض سعر",
    thinking: "أفكر...",
    clear: "مسح المحادثة",
  },
  "zh-CN": {
    open: "打开 AI 助手",
    title: "AI 助手",
    greeting: "您好!我可以回答有关亚洲市场合规、产品和物流的问题。请问有什么可以帮您?",
    placeholder: "输入您的问题...",
    quote: "申请报价",
    thinking: "思考中...",
    clear: "清除对话",
  },
  fr: {
    open: "Ouvrir l'assistant IA",
    title: "Assistant IA",
    greeting: "Bonjour ! Je réponds aux questions sur la conformité, les produits et la logistique en Afrique. Comment puis-je aider ?",
    placeholder: "Posez votre question...",
    quote: "Demander un devis",
    thinking: "Je réfléchis...",
    clear: "Effacer la conversation",
  },
  es: {
    open: "Abrir asistente IA",
    title: "Asistente IA",
    greeting: "¡Hola! Respondo preguntas sobre cumplimiento, productos y logística en Latinoamérica. ¿En qué puedo ayudar?",
    placeholder: "Escriba su pregunta...",
    quote: "Solicitar cotización",
    thinking: "Pensando...",
    clear: "Borrar conversación",
  },
};

interface Props {
  region: RegionContent;
}

export const RegionChat = ({ region }: Props) => {
  const storageKey = `region-chat:${region.slug}:v1`;
  const ui = UI[region.lang] ?? UI.de;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const initialMessages = useMemo<UIMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [storageKey]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: FN_URL,
        body: {
          region: {
            name: region.name,
            localizedName: region.localizedName,
            language: LANG_NAME[region.lang] ?? region.lang,
            langCode: region.hreflang,
            currency: region.currency,
            hub: region.hub,
            compliance: COMPLIANCE_BY_REGION[region.slug] ?? "regional chemical regulations",
          },
        },
      }),
    [region]
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    id: `region-${region.slug}`,
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message || "Chat error"),
  });

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      /* ignore quota */
    }
  }, [messages, storageKey]);

  // Auto-scroll
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status, open]);

  // Focus textarea on open and after sending
  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open, status]);

  const isBusy = status === "submitted" || status === "streaming";

  const handleSend = () => {
    const text = input.trim();
    if (!text || isBusy) return;
    setInput("");
    sendMessage({ text });
  };

  const handleClear = () => {
    setMessages([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={ui.open}
          className="fixed bottom-24 right-6 z-40 flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium">{ui.title}</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          dir={region.dir}
          className="fixed bottom-24 right-6 z-40 w-[calc(100vw-3rem)] sm:w-[400px] max-h-[70vh] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between p-3 border-b bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm leading-tight">{ui.title}</p>
                <p className="text-xs opacity-90 leading-tight">{region.flag} {region.localizedName}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={handleClear}
                  aria-label={ui.clear}
                  className="text-xs px-2 py-1 rounded hover:bg-primary-foreground/10"
                >
                  {ui.clear}
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-1 rounded hover:bg-primary-foreground/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 leading-relaxed">
                {ui.greeting}
              </div>
            )}

            {messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              if (m.role === "user") {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-3.5 py-2 text-sm whitespace-pre-wrap">
                      {text}
                    </div>
                  </div>
                );
              }
              return (
                <div key={m.id} className="text-sm leading-relaxed">
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-a:text-primary">
                    <ReactMarkdown
                      components={{
                        a: ({ href, children, ...props }) => {
                          if (href?.startsWith("/")) {
                            return (
                              <Link to={href} onClick={() => setOpen(false)} className="underline font-medium" {...(props as object)}>
                                {children}
                              </Link>
                            );
                          }
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                              {children}
                            </a>
                          );
                        },
                      }}
                    >
                      {text}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}

            {status === "submitted" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                {ui.thinking}
              </div>
            )}
          </div>

          <div className="border-t p-2 bg-card">
            <div className="flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={ui.placeholder}
                rows={1}
                className="min-h-[40px] max-h-32 resize-none text-sm"
                disabled={isBusy}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isBusy}
                size="icon"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <MessageSquare className="w-3 h-3" /> {ui.quote} →
            </Link>
          </div>
        </div>
      )}
    </>
  );
};
