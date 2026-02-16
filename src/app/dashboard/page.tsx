'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, ProcurementTask } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [tasks, setTasks] = useState<ProcurementTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, tasksRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('procurement_tasks').select('*').order('created_at', { ascending: false })
      ]);

      if (employeesRes.data) setEmployees(employeesRes.data as User[]);
      if (tasksRes.data) setTasks(tasksRes.data as ProcurementTask[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
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
          { title: "Pending", value: tasks.filter(t => t.status === 'Pending').length, sub: "Awaiting AI Assignment" },
          { title: "Avg. Utilization", value: `${Math.round(chartData.reduce((acc, curr) => acc + curr.utilization, 0) / (employees.length || 1))}%`, sub: "Team Bandwidth" }
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
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
