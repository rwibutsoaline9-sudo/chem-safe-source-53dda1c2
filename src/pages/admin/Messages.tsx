import { useEffect, useState, useRef, useCallback } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  MessageSquare,
  Clock,
  CheckCheck,
  Building2,
  Mail,
  Phone,
  Package,
  User,
  Archive,
  Star,
  StarOff,
  MoreVertical,
  ArrowLeft,
  Send,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ContactMessage {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  product: string;
  quantity: string;
  message: string | null;
  document_url: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Reply {
  id: string;
  message_id: string;
  sender_type: string;
  content: string;
  admin_id: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  unread: 'bg-primary text-primary-foreground',
  read: 'bg-muted text-muted-foreground',
  replied: 'bg-accent text-accent-foreground',
  archived: 'bg-secondary/20 text-secondary-foreground',
};

const formatTime = (dateStr: string | null) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const avatarColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
];

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const Messages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contact_messages' },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load messages');
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    }
  };

  const handleSelect = (msg: ContactMessage) => {
    setSelectedId(msg.id);
    if (msg.status === 'unread') {
      updateStatus(msg.id, 'read');
    }
  };

  const selected = messages.find((m) => m.id === selectedId);

  const filtered = messages.filter((m) => {
    const matchesSearch =
      m.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'all') return matchesSearch;
    return matchesSearch && m.status === filter;
  });

  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-0px)] overflow-hidden">
        {/* ── Left: Conversation List ── */}
        <div
          className={cn(
            'w-full md:w-[380px] flex-shrink-0 border-r flex flex-col bg-card',
            selected && 'hidden md:flex'
          )}
        >
          {/* Header */}
          <div className="p-4 border-b bg-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-bold">Messages</h1>
                {unreadCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-1 mt-3">
              {(['all', 'unread', 'read', 'archived'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'ghost'}
                  size="sm"
                  className="text-xs h-7 px-3 capitalize"
                  onClick={() => setFilter(f)}
                >
                  {f}
                  {f === 'unread' && unreadCount > 0 && (
                    <span className="ml-1 text-[10px]">({unreadCount})</span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Message list */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-3 px-4">
                      <div className="w-12 h-12 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No messages found</p>
                <p className="text-sm mt-1">Quote requests will appear here</p>
              </div>
            ) : (
              <div>
                {filtered.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => handleSelect(msg)}
                    className={cn(
                      'w-full text-left px-4 py-3 flex gap-3 hover:bg-muted/50 transition-colors border-b border-border/50',
                      selectedId === msg.id && 'bg-muted/70',
                      msg.status === 'unread' && 'bg-primary/5'
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0',
                        getAvatarColor(msg.business_name)
                      )}
                    >
                      {getInitials(msg.business_name)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'font-medium text-sm truncate',
                            msg.status === 'unread' && 'font-bold'
                          )}
                        >
                          {msg.business_name}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-muted-foreground truncate pr-2">
                          <span className="font-medium text-foreground/70">{msg.product}</span>
                          {' · '}
                          {msg.quantity}
                        </p>
                        {msg.status === 'unread' && (
                          <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
                        )}
                        {msg.status === 'read' && (
                          <CheckCheck className="h-4 w-4 text-primary/60 flex-shrink-0" />
                        )}
                      </div>
                      {msg.message && (
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {msg.message}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* ── Right: Message Detail ── */}
        <div
          ref={detailRef}
          className={cn(
            'flex-1 flex flex-col bg-background',
            !selected && 'hidden md:flex'
          )}
        >
          {selected ? (
            <>
              {/* Detail Header */}
              <div className="px-4 py-3 border-b bg-card flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedId(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold',
                    getAvatarColor(selected.business_name)
                  )}
                >
                  {getInitials(selected.business_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-sm truncate">{selected.business_name}</h2>
                  <p className="text-xs text-muted-foreground truncate">{selected.contact_name}</p>
                </div>
                <Badge className={cn('text-xs', statusColors[selected.status || 'unread'])}>
                  {selected.status || 'unread'}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => updateStatus(selected.id, 'unread')}>
                      <Star className="h-4 w-4 mr-2" /> Mark as Unread
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateStatus(selected.id, 'replied')}>
                      <CheckCheck className="h-4 w-4 mr-2" /> Mark as Replied
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateStatus(selected.id, 'archived')}>
                      <Archive className="h-4 w-4 mr-2" /> Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Chat-style Content */}
              <ScrollArea className="flex-1 p-4 md:p-6">
                {/* Wallpaper-like subtle pattern bg */}
                <div className="max-w-2xl mx-auto space-y-4">
                  {/* Date chip */}
                  <div className="flex justify-center">
                    <span className="bg-muted text-muted-foreground text-[11px] px-3 py-1 rounded-full shadow-sm">
                      {selected.created_at
                        ? new Date(selected.created_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Unknown date'}
                    </span>
                  </div>

                  {/* Quote Request Bubble */}
                  <div className="flex justify-start">
                    <div className="max-w-[85%] relative">
                      {/* Bubble tail */}
                      <div className="absolute -left-2 top-0 w-4 h-4 overflow-hidden">
                        <div className="w-4 h-4 bg-card rotate-45 transform origin-bottom-right border-l border-t border-border/50" />
                      </div>
                      <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm p-4 shadow-sm space-y-3">
                        {/* Title */}
                        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                          <Package className="h-4 w-4" />
                          Quote Request
                        </div>

                        {/* Info grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                          <InfoRow icon={Building2} label="Business" value={selected.business_name} />
                          <InfoRow icon={User} label="Contact" value={selected.contact_name} />
                          <InfoRow icon={Mail} label="Email" value={selected.email} isLink />
                          <InfoRow icon={Phone} label="Phone" value={selected.phone} />
                          <InfoRow icon={Package} label="Product" value={selected.product} highlight />
                          <InfoRow icon={Package} label="Quantity" value={selected.quantity} highlight />
                        </div>

                        {/* Message */}
                        {selected.message && (
                          <div className="pt-2 border-t border-border/50">
                            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                              {selected.message}
                            </p>
                          </div>
                        )}

                        {/* Document */}
                        {selected.document_url && (
                          <div className="pt-2 border-t border-border/50">
                            <a
                              href={selected.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              📎 Attached Document
                            </a>
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="flex justify-end">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {selected.created_at
                              ? new Date(selected.created_at).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex justify-center gap-2 pt-4">
                    <a href={`mailto:${selected.email}`}>
                      <Button variant="outline" size="sm" className="text-xs gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> Reply via Email
                      </Button>
                    </a>
                    <a
                      href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="text-xs gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                      </Button>
                    </a>
                    <a href={`tel:${selected.phone}`}>
                      <Button variant="outline" size="sm" className="text-xs gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> Call
                      </Button>
                    </a>
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground">
                  Select a conversation
                </h3>
                <p className="text-sm text-muted-foreground/70 max-w-xs">
                  Choose a quote request from the list to view the full details and take action.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

/* ── Reusable Info Row ── */
const InfoRow = ({
  icon: Icon,
  label,
  value,
  highlight,
  isLink,
}: {
  icon: any;
  label: string;
  value: string;
  highlight?: boolean;
  isLink?: boolean;
}) => (
  <div className="flex items-start gap-2">
    <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
    <div className="min-w-0">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
      {isLink ? (
        <a href={`mailto:${value}`} className="block text-sm text-primary hover:underline truncate">
          {value}
        </a>
      ) : (
        <p className={cn('text-sm truncate', highlight && 'font-semibold text-foreground')}>
          {value}
        </p>
      )}
    </div>
  </div>
);

export default Messages;
