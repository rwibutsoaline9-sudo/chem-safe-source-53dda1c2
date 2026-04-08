import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DollarSign, TrendingUp, AlertTriangle, FileText, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const statusColors: Record<string, string> = {
  succeeded: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-blue-100 text-blue-800',
};

const fraudColors: Record<string, string> = {
  safe: 'bg-green-100 text-green-800',
  suspicious: 'bg-yellow-100 text-yellow-800',
  flagged: 'bg-red-100 text-red-800',
};

const Payments = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, count: 0, flagged: 0, refunded: 0 });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [ordersRes, txRes, logsRes] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
    ]);

    const ordersData = ordersRes.data ?? [];
    const txData = txRes.data ?? [];
    const logsData = logsRes.data ?? [];

    setOrders(ordersData);
    setTransactions(txData);
    setAuditLogs(logsData);

    const succeeded = ordersData.filter(o => o.status === 'succeeded');
    setStats({
      revenue: succeeded.reduce((s, o) => s + Number(o.total_amount), 0),
      count: ordersData.length,
      flagged: ordersData.filter(o => o.fraud_flag !== 'safe').length,
      refunded: ordersData.filter(o => o.status === 'refunded').length,
    });

    setLoading(false);
  };

  // Build chart data from orders grouped by date
  const chartData = orders.reduce((acc: any[], order) => {
    const date = new Date(order.created_at).toLocaleDateString();
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.revenue += Number(order.total_amount);
      existing.orders += 1;
    } else {
      acc.push({ date, revenue: Number(order.total_amount), orders: 1 });
    }
    return acc;
  }, []).reverse().slice(0, 30);

  const handleRefund = async (orderId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-refund', {
        body: { order_id: orderId },
      });
      if (error) throw error;
      toast.success('Refund processed');
      fetchAll();
    } catch (err: any) {
      toast.error(err.message || 'Refund failed');
    }
  };

  const statCards = [
    { title: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-500' },
    { title: 'Total Orders', value: stats.count, icon: TrendingUp, color: 'text-primary' },
    { title: 'Fraud Alerts', value: stats.flagged, icon: AlertTriangle, color: 'text-destructive' },
    { title: 'Refunded', value: stats.refunded, icon: RefreshCw, color: 'text-blue-500' },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Payments & Analytics</h1>
          <Button variant="outline" onClick={fetchAll} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((s) => (
            <Card key={s.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Chart */}
        {chartData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="hsl(220, 80%, 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="fraud">Fraud Alerts</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Fraud</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No orders yet
                        </TableCell>
                      </TableRow>
                    ) : orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                        <TableCell>{order.customer_email || '—'}</TableCell>
                        <TableCell>${Number(order.total_amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-muted'}`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${fraudColors[order.fraud_flag || 'safe']}`}>
                            {order.fraud_flag || 'safe'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {order.status === 'succeeded' && (
                            <Button size="sm" variant="outline" onClick={() => handleRefund(order.id)}>
                              Refund
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>External ID</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No transactions yet
                        </TableCell>
                      </TableRow>
                    ) : transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-xs">{tx.id.slice(0, 8)}...</TableCell>
                        <TableCell>{tx.provider}</TableCell>
                        <TableCell>${Number(tx.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[tx.status] || 'bg-muted'}`}>
                            {tx.status}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{tx.external_id || '—'}</TableCell>
                        <TableCell className="text-sm">{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fraud">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Flag</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.filter(o => o.fraud_flag !== 'safe').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No fraud alerts — all clear!
                        </TableCell>
                      </TableRow>
                    ) : orders.filter(o => o.fraud_flag !== 'safe').map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                        <TableCell>{order.customer_email || '—'}</TableCell>
                        <TableCell>${Number(order.total_amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${fraudColors[order.fraud_flag]}`}>
                            {order.fraud_flag}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{order.ip_address || '—'}</TableCell>
                        <TableCell className="text-sm">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No audit logs yet
                        </TableCell>
                      </TableRow>
                    ) : auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{log.actor_id?.slice(0, 8) || 'system'}...</TableCell>
                        <TableCell className="max-w-48 truncate text-xs font-mono">
                          {log.data ? JSON.stringify(log.data).slice(0, 60) : '—'}
                        </TableCell>
                        <TableCell className="text-xs">{log.ip_address || '—'}</TableCell>
                        <TableCell className="text-sm">{new Date(log.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Payments;
