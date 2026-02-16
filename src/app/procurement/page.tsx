'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Brain, Sparkles, CheckCircle2, AlertCircle, Loader2, ArrowRight, Clock, User as UserIcon, ListTodo } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// @ts-ignore - Ignore lint error while package resolves in IDE
import { toast } from 'sonner';

export default function ProcurementPage() {
  const [title, setTitle] = useState('');
  const [requiredSkill, setRequiredSkill] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [loading, setLoading] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState<any>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // Fetch tasks with their assigned user's name if available
      const { data, error } = await supabase
        .from('procurement_tasks')
        .select(`
          *,
          users!procurement_tasks_assigned_to_fkey (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback if the relationship name is different or not easily resolvable
        const { data: simpleData, error: simpleError } = await supabase
          .from('procurement_tasks')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (simpleError) throw simpleError;
        setTasks(simpleData || []);
      } else {
        setTasks(data || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const totalPages = Math.ceil(tasks.length / itemsPerPage);
  const currentTasks = tasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCreateTask = async () => {
    if (!title || !requiredSkill || !estimatedHours) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('procurement_tasks')
        .insert({
          title,
          required_skill: requiredSkill,
          estimated_hours: parseInt(estimatedHours),
          priority,
          status: 'Pending'
        })
        .select()
        .single();

      if (error) throw error;

      setTaskId(data.id);
      toast.success("Task initialized successfully!");
      fetchTasks();
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(`System Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssign = async (specificId?: string) => {
    const idToAssign = specificId || taskId;
    if (!idToAssign) return;

    setLoading(true);
    setAssignmentResult(null);
    setActiveStep(1); // Fetching workforce

    if (specificId) {
      setTaskId(specificId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    try {
      // Simulate step progression for better UI feel
      setTimeout(() => setActiveStep(2), 1000); // AI Analysis

      const response = await fetch('/api/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: idToAssign })
      });

      const result = await response.json();

      if (!response.ok) {
        // Special handling for OpenAI Quota issues
        if (result.error?.includes('429') || result.details?.includes('429')) {
          throw new Error('AI AGENT QUOTA EXCEEDED: Your OpenAI API key has no credits or limit reached. Assignment failed.');
        }
        throw new Error(result.error || 'Assignment Agents failed to reach a consensus.');
      }

      setActiveStep(3); // Result processed
      setAssignmentResult(result);
      toast.success("AI talent matching completed!", {
        description: `Assigned to ${result.assignedTo}`,
        icon: <Sparkles className="w-4 h-4 text-green-600" />
      });
      fetchTasks();
    } catch (error: any) {
      console.error('Assignment error:', error);
      setActiveStep(0);
      toast.error("Agent Orchestration Failed", {
        description: error.message,
        duration: 8000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setRequiredSkill('');
    setEstimatedHours('');
    setPriority('Medium');
    setTaskId(null);
    setAssignmentResult(null);
    setActiveStep(0);
  };

  return (
    <div className="container mx-auto p-6 pt-24 max-w-[1400px] space-y-16 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Agentic Procurement
          </h1>
          <p className="text-muted-foreground text-xl">Define requirements and let the AI Agents orchestrate the perfect allocation.</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-4 py-2 border-blue-200 text-blue-600 bg-blue-50/50 shadow-sm">
            <Brain className="w-4 h-4 mr-2" /> Fully Agentic Mode
          </Badge>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12 max-w-6xl mx-auto w-full">
        {/* Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-none shadow-xl bg-white shadow-blue-500/5">
            <CardHeader>
              <CardTitle>Task Definition</CardTitle>
              <CardDescription>Specify the procurement request requirements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">Requirement Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Strategic Vendor Sourcing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading || !!taskId}
                  className="bg-gray-50/50 border-gray-100 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill" className="text-sm font-semibold">Primary Expertise Required</Label>
                <Select value={requiredSkill} onValueChange={setRequiredSkill} disabled={loading || !!taskId}>
                  <SelectTrigger id="skill" className="bg-gray-50/50 border-gray-100">
                    <SelectValue placeholder="Identify core skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Procurement">Procurement</SelectItem>
                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                    <SelectItem value="Vendor Management">Vendor Management</SelectItem>
                    <SelectItem value="Contract Management">Contract Management</SelectItem>
                    <SelectItem value="Supply Chain">Supply Chain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hours" className="text-sm font-semibold">Estimated Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    placeholder="10"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    disabled={loading || !!taskId}
                    className="bg-gray-50/50 border-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-semibold">System Priority</Label>
                  <Select value={priority} onValueChange={(val) => setPriority(val as any)} disabled={loading || !!taskId}>
                    <SelectTrigger id="priority" className="bg-gray-50/50 border-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              {!taskId ? (
                <Button onClick={handleCreateTask} disabled={loading || !title || !requiredSkill || !estimatedHours} className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                  Initialize Task Assignment
                </Button>
              ) : (
                <div className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg text-green-700 font-medium text-sm animate-in zoom-in-95">
                  <div className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Task Created Successfully
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-none font-bold">ID: {taskId.slice(0, 5)}</Badge>
                </div>
              )}
              
              {taskId && !assignmentResult && (
                <Button 
                  onClick={() => handleAutoAssign()} 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 shadow-lg shadow-purple-200"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Agents Orchestrating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" /> Run AI Talent Match</>
                  )}
                </Button>
              )}

              {(taskId || assignmentResult) && (
                <Button onClick={handleReset} variant="ghost" disabled={loading} className="w-full text-muted-foreground">
                  Reset and New Task
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* AI Response/Progress Area */}
        <div className="lg:col-span-7">
          {!taskId && !loading && (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl p-12 text-center text-muted-foreground opacity-60">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <Brain className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="font-semibold text-lg text-gray-400 font-sans">Awaiting Task Parameters</h3>
              <p className="max-w-[280px] mt-2 text-sm italic">"The AI Agent requires a task definition before it can begin workforce analysis and optimal allocation."</p>
            </div>
          )}

          {loading && !assignmentResult && (
            <Card className="border-none shadow-2xl bg-white overflow-hidden">
               <div className="h-1 bg-blue-100 w-full overflow-hidden">
                <div className="h-full bg-blue-600 animate-progress origin-left"></div>
              </div>
              <CardContent className="p-12 text-center space-y-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-100 animate-ping rounded-full scale-150 opacity-20"></div>
                  <Brain className="w-16 h-16 text-blue-600 mx-auto relative animate-pulse" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Agent Orchestration in Progress
                  </h3>
                  <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                    {[
                      { step: 1, label: "Workforce Agent: Fetching employee bandwidth data..." },
                      { step: 2, label: "Assignment Agent: OpenAI Model-4o Analysis..." },
                      { step: 3, label: "Finalizing optimal resource allocation..." }
                    ].map((s) => (
                      <div key={s.step} className={`flex items-center gap-3 text-sm transition-all duration-500 ${activeStep >= s.step ? 'text-blue-600 font-semibold' : 'text-gray-300'}`}>
                        {activeStep > s.step ? <CheckCircle2 className="w-4 h-4" /> : activeStep === s.step ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-1 bg-gray-200 rounded"></div>}
                        {s.label}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {assignmentResult && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <Card className="border-none shadow-2xl bg-gradient-to-br from-white to-blue-50/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Sparkles className="w-24 h-24 text-blue-600" />
                </div>
                <CardHeader className="border-b border-gray-100 bg-white/80">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Optimal Assignment Found</CardTitle>
                        <CardDescription>AI Agent Decision Record</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Match Score</div>
                      <div className="text-3xl font-black text-blue-600">{(assignmentResult.score * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="flex items-center justify-between p-6 bg-white border border-blue-50 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                        {assignmentResult.assignedTo.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Assigned Talent</div>
                        <div className="text-2xl font-extrabold text-gray-900">{assignmentResult.assignedTo}</div>
                      </div>
                    </div>
                    <Badge className="bg-blue-600 text-white px-4 py-1">Confirmed</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      <Brain className="w-4 h-4 text-purple-600" />
                      AI REASONING
                    </div>
                    <div className="bg-white/60 p-6 rounded-2xl text-gray-600 leading-relaxed text-lg border border-gray-100 italic shadow-inner">
                      {assignmentResult.reasoning.replace('🤖 AI-Powered Assignment\n\n', '').replace('[AI-POWERED ASSIGNMENT]\n\n', '')}
                    </div>
                  </div>

                  {assignmentResult.logs && (
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Agent Execution Trace</div>
                      <div className="bg-gray-900 p-4 rounded-xl text-xs font-mono text-gray-400 space-y-1.5 border border-gray-800 shadow-xl overflow-hidden">
                        {assignmentResult.logs.map((log: string, idx: number) => (
                          <div key={idx} className="flex gap-4">
                            <span className="text-gray-600 select-none">[{idx + 1}]</span>
                            <span className={log.includes('✅') ? 'text-green-500' : log.includes('🤖') ? 'text-blue-400' : ''}>{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Tasks List Table */}
      <section className="space-y-6 pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/20">
              <ListTodo className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Recent Procurement Requests</h2>
              <p className="text-muted-foreground text-lg">Monitor and manage all system-generated tasks and their AI status.</p>
            </div>
          </div>
          <Badge variant="outline" className="h-8 px-4 rounded-full border-gray-200 text-gray-600 bg-gray-50/50 font-bold">
            Total Tasks: {tasks.length}
          </Badge>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden bg-white/70 backdrop-blur-md rounded-[2rem] border border-white/20">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-gray-100 h-16">
                  <TableHead className="w-[25%] pl-10 text-xs font-black uppercase tracking-[0.2em] text-gray-400">Requirement</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Expertise</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Priority</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Hours</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Assigned To</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Status</TableHead>
                  <TableHead className="text-right pr-10 text-xs font-black uppercase tracking-[0.2em] text-gray-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center text-muted-foreground text-lg italic">
                      No procurement tasks found.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentTasks.map((task) => (
                    <TableRow key={task.id} className="group hover:bg-blue-50/40 transition-all duration-300 border-gray-50 h-24">
                      <TableCell className="font-bold text-lg pl-10 text-gray-900">{task.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold bg-white px-3 py-1 border-gray-100 text-gray-600 shadow-sm">
                          {task.required_skill}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${
                          task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                          task.priority === 'Medium' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                          'bg-gray-50 text-gray-600 border-gray-100'
                        } border font-black text-[10px] uppercase tracking-widest px-3 py-1 shadow-sm`}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-base font-medium text-gray-500">{task.estimated_hours}h</TableCell>
                      <TableCell>
                        {task.users?.name ? (
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                              {task.users.name.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-gray-700">{task.users.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400 italic text-sm">
                            <Clock className="w-4 h-4" />
                            <span>Unassigned</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${
                          task.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 
                          'bg-yellow-100 text-yellow-700'
                        } border-none font-bold px-4 py-1.5 rounded-full text-xs`}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        {task.status === 'Pending' && (
                          <Button 
                            size="lg" 
                            variant="outline"
                            onClick={() => handleAutoAssign(task.id)}
                            disabled={loading}
                            className="bg-white hover:bg-blue-600 hover:text-white border-blue-200 text-blue-600 font-black tracking-widest text-[10px] uppercase transition-all shadow-md px-6 rounded-full group-hover:scale-105"
                          >
                            <Sparkles className="w-3 h-3 mr-2" /> Auto Assign
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-10 py-6 bg-gray-50/50 border-t border-gray-100">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                Showing <span className="text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, tasks.length)}</span> of <span className="text-gray-900">{tasks.length}</span> requests
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border-gray-200 hover:bg-white hover:text-blue-600 font-bold transition-all disabled:opacity-30"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-lg text-xs font-black transition-all ${
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
                  className="rounded-xl border-gray-200 hover:bg-white hover:text-blue-600 font-bold transition-all disabled:opacity-30"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
