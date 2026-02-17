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
import { SplineSceneBasic } from '@/components/ui/spline-demo';

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
    <div className="container mx-auto p-6 pt-24 space-y-16 animate-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section with 3D Spline */}
      <div className="mb-12">
        <SplineSceneBasic />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
       
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
      <Card className="border-none shadow-2xl overflow-hidden bg-white">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Recent Procurement Requests</CardTitle>
              <CardDescription>Monitor and manage all system-generated tasks and their AI status.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-white">Total: {tasks.length}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/30">
              <TableRow>
                <TableHead className="pl-8 py-5">Requirement</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-8">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-20 text-center text-muted-foreground italic">
                    No procurement tasks found.
                  </TableCell>
                </TableRow>
              ) : (
                currentTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-blue-50/20 transition-all duration-300 group">
                    <TableCell className="pl-8 py-6">
                      <div className="font-bold text-gray-900">{task.title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-white border text-[10px] uppercase font-bold tracking-tight text-gray-500 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">
                        {task.required_skill}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border-none ${
                        task.priority === 'High' ? 'bg-red-100 text-red-700' : 
                        task.priority === 'Medium' ? 'bg-blue-100 text-blue-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-base font-medium text-gray-500">
                      {task.estimated_hours}h
                    </TableCell>
                    <TableCell>
                      {task.users?.name ? (
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-500 group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-500">
                            {task.users.name.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-900">{task.users.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground italic text-sm">
                          <Clock className="w-4 h-4" />
                          <span>Unassigned</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`border-none ${
                        task.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      {task.status === 'Pending' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAutoAssign(task.id)}
                          disabled={loading}
                          className="bg-white hover:bg-blue-600 hover:text-white border-gray-200 text-gray-600 font-bold transition-all shadow-md rounded-xl"
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
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-8 py-6 bg-gray-50/50 border-t border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Showing <span className="text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, tasks.length)}</span> of <span className="text-gray-900">{tasks.length}</span> requests
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border-gray-200 bg-white hover:text-blue-600 font-bold transition-all disabled:opacity-30"
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
                  className="rounded-xl border-gray-200 bg-white hover:text-blue-600 font-bold transition-all disabled:opacity-30"
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
