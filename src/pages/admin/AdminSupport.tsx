import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Package,
  CreditCard,
  Truck,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  User,
} from "lucide-react";

interface Conversation {
  id: string;
  user_id: string;
  order_id: string | null;
  subject: string;
  issue_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

const issueIcons: Record<string, React.ReactNode> = {
  order: <Package className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
  delivery: <Truck className="h-4 w-4" />,
  general: <HelpCircle className="h-4 w-4" />,
};

const statusConfig: Record<string, { icon: React.ReactNode; label: string; class: string }> = {
  open: { icon: <Clock className="h-3.5 w-3.5" />, label: "Open", class: "bg-accent/10 text-accent" },
  resolved: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Resolved", class: "bg-primary/10 text-primary" },
  closed: { icon: <XCircle className="h-3.5 w-3.5" />, label: "Closed", class: "bg-muted text-muted-foreground" },
};

export default function AdminSupport() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "resolved" | "closed">("all");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch all conversations (admin sees all)
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("support_conversations")
        .select("*")
        .order("updated_at", { ascending: false });
      const convos = (data as Conversation[]) || [];
      setConversations(convos);
      setLoading(false);

      // Fetch profiles for all user_ids
      const userIds = [...new Set(convos.map((c) => c.user_id))];
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);
        const map: Record<string, Profile> = {};
        (profileData || []).forEach((p: any) => { map[p.id] = p; });
        setProfiles(map);
      }
    };
    load();

    const channel = supabase
      .channel("admin-convos")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_conversations" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Fetch messages
  useEffect(() => {
    if (!activeConvo) return;
    const load = async () => {
      const { data } = await supabase
        .from("support_messages")
        .select("*")
        .eq("conversation_id", activeConvo.id)
        .order("created_at", { ascending: true });
      setMessages((data as Message[]) || []);
    };
    load();

    const channel = supabase
      .channel(`admin-msgs-${activeConvo.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `conversation_id=eq.${activeConvo.id}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConvo]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!user || !activeConvo || !input.trim()) return;
    setSending(true);
    const { error } = await supabase.from("support_messages").insert({
      conversation_id: activeConvo.id,
      sender_id: user.id,
      sender_role: "admin",
      content: input.trim(),
    });
    if (error) toast.error(error.message);
    else setInput("");
    setSending(false);
  };

  const updateStatus = async (status: string) => {
    if (!activeConvo) return;
    const { error } = await supabase
      .from("support_conversations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", activeConvo.id);
    if (error) { toast.error(error.message); return; }
    setActiveConvo({ ...activeConvo, status });
    setConversations((prev) => prev.map((c) => c.id === activeConvo.id ? { ...c, status } : c));
    toast.success(`Conversation marked as ${status}`);
  };

  const filtered = filter === "all" ? conversations : conversations.filter((c) => c.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Support Chats</h1>
        <div className="flex gap-1">
          {(["all", "open", "resolved", "closed"] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="text-xs capitalize">
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card snap-card-shadow overflow-hidden" style={{ height: "calc(100vh - 12rem)" }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className={`border-r flex flex-col ${activeConvo ? "hidden md:flex" : "flex"} w-full md:w-80 shrink-0`}>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No conversations</p>
                </div>
              ) : (
                filtered.map((c) => {
                  const st = statusConfig[c.status] || statusConfig.open;
                  const prof = profiles[c.user_id];
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveConvo(c)}
                      className={`w-full text-left p-3 border-b hover:bg-secondary/50 transition-colors ${activeConvo?.id === c.id ? "bg-secondary" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-muted-foreground">{issueIcons[c.issue_type] || issueIcons.general}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{c.subject}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground truncate">{prof?.full_name || prof?.email || "User"}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${st.class}`}>
                              {st.icon} {st.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(c.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col ${!activeConvo ? "hidden md:flex" : "flex"}`}>
            {activeConvo ? (
              <>
                <div className="flex items-center gap-3 p-4 border-b">
                  <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setActiveConvo(null)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{activeConvo.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {profiles[activeConvo.user_id]?.full_name || "User"} · {activeConvo.issue_type} issue
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {activeConvo.status === "open" && (
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => updateStatus("resolved")}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                      </Button>
                    )}
                    {activeConvo.status !== "closed" && (
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => updateStatus("closed")}>
                        <XCircle className="h-3.5 w-3.5" /> Close
                      </Button>
                    )}
                    {activeConvo.status === "closed" && (
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => updateStatus("open")}>
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">No messages yet</p>
                  )}
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender_role === "admin" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        m.sender_role === "admin"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}>
                        {m.sender_role !== "admin" && (
                          <p className="text-[10px] font-medium opacity-70 mb-1">
                            {profiles[m.sender_id]?.full_name || "User"}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <p className={`text-[10px] mt-1 ${m.sender_role === "admin" ? "opacity-70" : "text-muted-foreground"}`}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2 p-3 border-t">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Reply to user..."
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={sending}
                  />
                  <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={sending || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a conversation to respond</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
