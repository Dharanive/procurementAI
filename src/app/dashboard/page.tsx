'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, ProcurementTask, InventoryPrediction, BudgetInfo, ApprovalRequest } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, LineChart, Line, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, DollarSign, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { ApprovalDialog } from '@/components/ApprovalDialog';

export default function DashboardPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [tasks, setTasks] = useState<ProcurementTask[]>([]);
  const [predictions, setPredictions] = useState<InventoryPrediction[]>([]);
  const [budgets, setBudgets] = useState<BudgetInfo[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, tasksRes, predictionsRes, budgetsRes, approvalsRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('procurement_tasks').select('*').order('created_at', { ascending: false }),
        fetch('/api/predictions').then(r => r.json()).catch(() => ({ predictions: [] })),
        fetch('/api/budgets').then(r => r.json()).catch(() => ({ budgets: [] })),
        fetch('/api/approvals').then(r => r.json()).catch(() => ({ approvals: [] }))
      ]);

      if (employeesRes.data) setEmployees(employeesRes.data as User[]);
      if (tasksRes.data) setTasks(tasksRes.data as ProcurementTask[]);
      if (predictionsRes.predictions) setPredictions(predictionsRes.predictions);
      if (budgetsRes.budgets) setBudgets(budgetsRes.budgets);
      if (approvalsRes.approvals) setApprovals(approvalsRes.approvals);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalProcessed = () => {
    fetchData();
    setSelectedApproval(null);
  };

  const getUtilization = (emp: User) => {
    if (emp.max_capacity === 0) return 0;
    return Math.round((emp.allocated_hours / emp.max_capacity) * 100);
  };

  const chartData = employees.map(emp => ({
    name: emp.name.split(' ')[0],
    utilization: getUtilization(emp),
    hours: emp.allocated_hours
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const paginatedEmployees = employees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-24 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Executive Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">Real-time oversight of procurement operations and workforce bandwidth.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { title: "Total Talent", value: employees.length, sub: "Active Employees" },
          { title: "Active Tasks", value: tasks.length, sub: "Last 30 Days" },
          { title: "Pending Approvals", value: approvals.length, sub: "Awaiting Review", icon: Clock },
          { title: "Avg. Utilization", value: `${Math.round(chartData.reduce((acc, curr) => acc + curr.utilization, 0) / (employees.length || 1))}%`, sub: "Team Bandwidth" }
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                {stat.icon && <stat.icon className="w-4 h-4" />}
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Workload Chart */}
        <Card className="lg:col-span-4 border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Workload Distribution</CardTitle>
            <CardDescription>Current utilization percentage per employee</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  cursor={{fill: 'rgba(59, 130, 246, 0.1)'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="utilization" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.utilization > 90 ? '#ef4444' : entry.utilization > 70 ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Priority Pie */}
        <Card className="lg:col-span-3 border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
            <CardDescription>Task distribution by priority level</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'High', value: tasks.filter(t => t.priority === 'High').length },
                    { name: 'Medium', value: tasks.filter(t => t.priority === 'Medium').length },
                    { name: 'Low', value: tasks.filter(t => t.priority === 'Low').length },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#ef4444" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* PRIORITY 1 FEATURES SECTION */}
      
      {/* 1. Predictive Inventory Cards */}
      <Card className="border-none shadow-2xl overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-orange-600/10 to-red-600/10 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendingDown className="w-6 h-6 text-orange-600" />
                Predictive Inventory Alerts
              </CardTitle>
              <CardDescription>AI-powered predictions of future inventory shortages</CardDescription>
            </div>
            <Badge variant="outline" className="bg-white">
              {predictions.filter(p => p.risk_level === 'Critical' || p.risk_level === 'High').length} High Risk
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {predictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No predictions available. Add inventory consumption history to see predictions.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {predictions.slice(0, 6).map((pred) => {
                const riskColors = {
                  Critical: 'bg-red-100 text-red-700 border-red-300',
                  High: 'bg-orange-100 text-orange-700 border-orange-300',
                  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                  Low: 'bg-green-100 text-green-700 border-green-300'
                };
                return (
                  <Card key={pred.inventory_id} className="border-2 hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{pred.item_name}</CardTitle>
                        <Badge className={riskColors[pred.risk_level]}>
                          {pred.risk_level}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current Stock:</span>
                        <span className="font-bold">{pred.current_stock} units</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Days Until Depletion:</span>
                        <span className="font-bold text-orange-600">{pred.days_until_depletion} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Daily Consumption:</span>
                        <span className="font-bold">{pred.average_daily_consumption.toFixed(2)}/day</span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground italic">{pred.recommended_action}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Budget Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-2xl overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-b border-gray-100">
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-blue-600" />
              Budget Utilization
            </CardTitle>
            <CardDescription>Real-time spending vs. budget caps</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            {budgets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No budgets configured
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={budgets}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis 
                    dataKey="category" 
                    type="category" 
                    width={100} 
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.05)'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Utilization']}
                  />
                  <Bar dataKey="utilization_percentage" radius={[0, 4, 4, 0]} barSize={20}>
                    {budgets.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.utilization_percentage > 100 ? '#ef4444' : entry.utilization_percentage > 80 ? '#f59e0b' : '#3b82f6'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-b border-gray-100">
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-purple-600" />
              Budget Distribution
            </CardTitle>
            <CardDescription>Financial breakdown across departments</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            {budgets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No budget data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgets}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="current_spend"
                    nameKey="category"
                  >
                    {budgets.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Spent']}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Approval Queue Table */}
      <Card className="border-none shadow-2xl overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                Approval Queue
              </CardTitle>
              <CardDescription>Pending approval requests requiring your review</CardDescription>
            </div>
            <Badge variant="outline" className="bg-white">
              {approvals.length} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {approvals.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
              <p className="text-lg">No pending approvals</p>
              <p className="text-sm">All approval requests have been processed</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/30">
                <TableRow>
                  <TableHead className="pl-8 py-5">Request Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Current Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right pr-8">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvals.map((approval) => (
                  <TableRow key={approval.id} className="hover:bg-blue-50/20 transition-all duration-300">
                    <TableCell className="pl-8 py-6">
                      <div className="font-bold text-gray-900">{approval.request_type}</div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-blue-600">${approval.amount.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-700">
                        Level {approval.current_approver_level} of {approval.max_approval_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(approval.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedApproval(approval);
                          setApprovalDialogOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <ApprovalDialog
        approval={selectedApproval}
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        onApproved={handleApprovalProcessed}
      />



      {/* Employees Table */}
      <Card className="border-none shadow-2xl overflow-hidden bg-white">
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-6">
          <CardTitle>Workforce Capacity</CardTitle>
          <CardDescription>Detailed view of employee roles and current loads</CardDescription>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-8 py-5">Name</TableHead>
                <TableHead>Principal Role</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead className="text-right pr-8">Utilization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEmployees.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-blue-50/20 transition-all duration-300">
                  <TableCell className="font-bold text-gray-900 pl-8 py-6">{emp.name}</TableCell>
                  <TableCell className="text-muted-foreground font-medium">{emp.role}</TableCell>
                  <TableCell>
                    <div className="flex gap-1.5 flex-wrap max-w-[200px]">
                      {emp.skills.slice(0, 2).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-white border text-[10px] uppercase font-bold tracking-tight text-gray-500">{skill}</Badge>
                      ))}
                      {emp.skills.length > 2 && <Badge variant="outline" className="text-[10px]">+{emp.skills.length - 2}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="pr-8">
                    <div className="flex items-center justify-end gap-4">
                      <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            getUtilization(emp) > 90 ? 'bg-red-500' : getUtilization(emp) > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(getUtilization(emp), 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-black tabular-nums min-w-[32px]">{getUtilization(emp)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-8 py-6 bg-gray-50/50 border-t border-gray-100">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Page <span className="text-gray-900">{currentPage}</span> of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border-gray-200 bg-white hover:text-blue-600 font-bold transition-all disabled:opacity-30 h-8"
                >
                  Prev
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-7 w-7 rounded-lg text-[10px] font-black transition-all ${
                        currentPage === page 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                          : "text-gray-400 hover:bg-white hover:text-blue-600"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border-gray-200 bg-white hover:text-blue-600 font-bold transition-all disabled:opacity-30 h-8"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
