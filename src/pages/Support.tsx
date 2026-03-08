import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/user/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  MessageSquare,
  Send,
  Plus,
  ArrowLeft,
  Package,
  CreditCard,
  Truck,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function Support() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [newIssueType, setNewIssueType] = useState("general");
  const [newOrderId, setNewOrderId] = useState("");
  const [orders, setOrders] = useState<{ id: string; total_amount: number; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("support_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      setConversations((data as Conversation[]) || []);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("user-convos")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_conversations", filter: `user_id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Fetch messages for active convo
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
      .channel(`msgs-${activeConvo.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `conversation_id=eq.${activeConvo.id}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConvo]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Fetch user orders for new conversation
  useEffect(() => {
    if (!user || !showNew) return;
    supabase.from("orders").select("id, total_amount, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      setOrders(data || []);
    });
  }, [user, showNew]);

  const createConversation = async () => {
    if (!user || !newSubject.trim()) return;
    const { data, error } = await supabase
      .from("support_conversations")
      .insert({
        user_id: user.id,
        subject: newSubject.trim(),
        issue_type: newIssueType,
        order_id: newOrderId || null,
      })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    setConversations((prev) => [data as Conversation, ...prev]);
    setActiveConvo(data as Conversation);
    setShowNew(false);
    setNewSubject("");
    setNewIssueType("general");
    setNewOrderId("");
  };

  const sendMessage = async () => {
    if (!user || !activeConvo || !input.trim()) return;
    setSending(true);
    const { error } = await supabase.from("support_messages").insert({
      conversation_id: activeConvo.id,
      sender_id: user.id,
      sender_role: "user",
      content: input.trim(),
    });
    if (error) toast.error(error.message);
    else setInput("");
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-4xl py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Support</h1>
            <p className="text-sm text-muted-foreground">Chat with our team about any issues</p>
          </div>
          <Button onClick={() => setShowNew(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Conversation
          </Button>
        </div>

        <div className="rounded-2xl border bg-card snap-card-shadow overflow-hidden" style={{ height: "calc(100vh - 14rem)" }}>
          <div className="flex h-full">
            {/* Sidebar */}
            <div className={`border-r flex flex-col ${activeConvo ? "hidden md:flex" : "flex"} w-full md:w-80 shrink-0`}>
              <div className="p-3 border-b">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Conversations</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                ) : (
                  conversations.map((c) => {
                    const st = statusConfig[c.status] || statusConfig.open;
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
                      <p className="text-xs text-muted-foreground capitalize">{activeConvo.issue_type} issue</p>
                    </div>
                    {(() => { const st = statusConfig[activeConvo.status] || statusConfig.open; return (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${st.class}`}>
                        {st.icon} {st.label}
                      </span>
                    ); })()}
                  </div>

                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground py-8">Send a message to start the conversation</p>
                    )}
                    {messages.map((m) => (
                      <div key={m.id} className={`flex ${m.sender_role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                          m.sender_role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}>
                          {m.sender_role !== "user" && (
                            <p className="text-[10px] font-medium opacity-70 mb-1">Admin</p>
                          )}
                          <p className="whitespace-pre-wrap">{m.content}</p>
                          <p className={`text-[10px] mt-1 ${m.sender_role === "user" ? "opacity-70" : "text-muted-foreground"}`}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {activeConvo.status !== "closed" && (
                    <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2 p-3 border-t">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        disabled={sending}
                      />
                      <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={sending || !input.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Select a conversation or start a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* New conversation dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Support Conversation</DialogTitle>
            <DialogDescription>Describe your issue and we'll help you resolve it.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground">Issue Type</label>
              <Select value={newIssueType} onValueChange={setNewIssueType}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">Order Issue</SelectItem>
                  <SelectItem value="payment">Payment Issue</SelectItem>
                  <SelectItem value="delivery">Delivery Issue</SelectItem>
                  <SelectItem value="general">General Help</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {orders.length > 0 && (
              <div>
                <label className="text-sm font-medium text-foreground">Related Order (optional)</label>
                <Select value={newOrderId} onValueChange={setNewOrderId}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select an order" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        ₹{o.total_amount} — {new Date(o.created_at).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground">Subject</label>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button onClick={createConversation} className="w-full" disabled={!newSubject.trim()}>
              Start Conversation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
