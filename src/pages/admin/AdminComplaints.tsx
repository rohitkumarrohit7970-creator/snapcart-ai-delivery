import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, User, Package, Clock, CheckCircle2, XCircle, Send } from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
  open: { label: "Open", class: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3 w-3" /> },
  in_progress: { label: "In Progress", class: "bg-blue-100 text-blue-800", icon: <Package className="h-3 w-3" /> },
  resolved: { label: "Resolved", class: "bg-green-100 text-green-800", icon: <CheckCircle2 className="h-3 w-3" /> },
  closed: { label: "Closed", class: "bg-muted text-muted-foreground", icon: <XCircle className="h-3 w-3" /> },
};

export default function AdminComplaints() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [responses, setResponses] = useState<Record<string, string>>({});

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["admin-complaints"],
    queryFn: async () => {
      const { data, error } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const userIds = [...new Set(complaints.map((c: any) => c.user_id))];
  const orderIds = [...new Set(complaints.map((c: any) => c.order_id))];

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-complaints-profiles", userIds],
    enabled: userIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, email, phone").in("id", userIds);
      return data || [];
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-complaints-orders", orderIds],
    enabled: orderIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("id, status, total_amount, created_at").in("id", orderIds);
      return data || [];
    },
  });

  const profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]));
  const orderMap = Object.fromEntries(orders.map((o: any) => [o.id, o]));

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, admin_response }: { id: string; status?: string; admin_response?: string }) => {
      const updates: any = { updated_at: new Date().toISOString() };
      if (status) updates.status = status;
      if (admin_response !== undefined) updates.admin_response = admin_response;
      const { error } = await supabase.from("complaints").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      toast.success("Complaint updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const sendResponse = (id: string) => {
    const text = responses[id]?.trim();
    if (!text) return;
    updateMutation.mutate({ id, admin_response: text, status: "in_progress" });
    setResponses((prev) => ({ ...prev, [id]: "" }));
  };

  const filtered = filter === "all" ? complaints : complaints.filter((c: any) => c.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Complaints</h1>
          <p className="text-muted-foreground text-sm">{complaints.length} total complaints</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="snap-card-shadow">
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No complaints found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((complaint: any) => {
            const user = profileMap[complaint.user_id];
            const order = orderMap[complaint.order_id];
            const st = statusConfig[complaint.status] || statusConfig.open;

            return (
              <Card key={complaint.id} className="snap-card-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{user?.full_name || "Unknown User"}</CardTitle>
                        <p className="text-xs text-muted-foreground">{user?.email} · {user?.phone || "No phone"}</p>
                      </div>
                    </div>
                    <Badge className={`gap-1 ${st.class}`}>
                      {st.icon} {st.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="capitalize">{complaint.issue_type}</Badge>
                    <span>·</span>
                    <span>Order #{complaint.order_id.slice(0, 8).toUpperCase()}</span>
                    {order && <span>· ₹{order.total_amount} · {order.status}</span>}
                    <span>·</span>
                    <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                  </div>

                  {complaint.description && (
                    <div className="rounded-lg bg-secondary/50 px-4 py-3 text-sm text-foreground">
                      {complaint.description}
                    </div>
                  )}

                  {complaint.admin_response && (
                    <div className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-foreground">
                      <p className="text-[10px] font-medium text-primary mb-1">Admin Response</p>
                      {complaint.admin_response}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a response..."
                      value={responses[complaint.id] || ""}
                      onChange={(e) => setResponses((prev) => ({ ...prev, [complaint.id]: e.target.value }))}
                      className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => sendResponse(complaint.id)} disabled={!responses[complaint.id]?.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-1.5 justify-end">
                    {complaint.status !== "resolved" && (
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => updateMutation.mutate({ id: complaint.id, status: "resolved" })}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                      </Button>
                    )}
                    {complaint.status !== "closed" && (
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => updateMutation.mutate({ id: complaint.id, status: "closed" })}>
                        <XCircle className="h-3.5 w-3.5" /> Close
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
  );
}
