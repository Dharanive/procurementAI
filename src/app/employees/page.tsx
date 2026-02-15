'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserMinus, UserX, Briefcase, Zap, Search, UserPlus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
// @ts-ignore
import { toast } from 'sonner';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addingEmployee, setAddingEmployee] = useState(false);

  // Form State
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newCapacity, setNewCapacity] = useState('40');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (error) throw error;
      setEmployees(data as User[]);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRole || !newSkills) {
      toast.error("Please fill in all fields.");
      return;
    }

    setAddingEmployee(true);
    try {
      const skillsArray = newSkills.split(',').map(s => s.trim()).filter(s => s !== '');
      
      const { error } = await supabase
        .from('users')
        .insert({
          name: newName,
          role: newRole,
          skills: skillsArray,
          max_capacity: parseInt(newCapacity),
          allocated_hours: 0
        });

      if (error) throw error;

      toast.success(`${newName} added to the workforce!`);
      setIsDialogOpen(false);
      resetForm();
      fetchEmployees();
    } catch (error: any) {
      toast.error(`Error adding employee: ${error.message}`);
    } finally {
      setAddingEmployee(false);
    }
  };

  const resetForm = () => {
    setNewName('');
    setNewRole('');
    setNewSkills('');
    setNewCapacity('40');
  };

  const getUtilization = (emp: User) => {
    if (emp.max_capacity === 0) return 0;
    return Math.round((emp.allocated_hours / emp.max_capacity) * 100);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-24 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight">Workforce Directory</h1>
          <p className="text-muted-foreground text-lg">Manage procurement talent and monitor live capacity allocation.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              placeholder="Search talent, skills, roles..." 
              className="w-full h-10 pl-10 pr-4 rounded-md bg-white border-none shadow-md focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 gap-2">
                <UserPlus className="w-4 h-4" /> Add Talent
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleAddEmployee}>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Fill in the details to add a new specialist to the procurement workforce.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., John Doe"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Professional Role</Label>
                    <Input
                      id="role"
                      placeholder="e.g., Senior Engine Specialist"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      placeholder="e.g., Procurement, V8 Engines, Negotiation"
                      value={newSkills}
                      onChange={(e) => setNewSkills(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="capacity">Weekly Capacity (Hours)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={newCapacity}
                      onChange={(e) => setNewCapacity(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addingEmployee} className="bg-blue-600 hover:bg-blue-700">
                    {addingEmployee ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</> : 'Save Employee'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { icon: Users, label: "Full Roster", value: employees.length, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: UserCheck, label: "Optimal Cap", value: employees.filter(e => getUtilization(e) < 70).length, color: "text-green-600", bg: "bg-green-50" },
          { icon: Zap, label: "High Demand", value: employees.filter(e => getUtilization(e) >= 70 && getUtilization(e) < 90).length, color: "text-amber-600", bg: "bg-amber-50" },
          { icon: UserX, label: "Overloaded", value: employees.filter(e => getUtilization(e) >= 90).length, color: "text-red-600", bg: "bg-red-50" }
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-3xl font-black mt-1">{stat.value}</h3>
                </div>
                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-2xl overflow-hidden bg-white">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Talent Inventory</CardTitle>
              <CardDescription>Live workforce analysis and skill distribution mapping</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-white">Total: {filteredEmployees.length}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/30">
              <TableRow>
                <TableHead className="pl-8 py-5">Talent Profile</TableHead>
                <TableHead>System Role</TableHead>
                <TableHead>Specialized Skills</TableHead>
                <TableHead>Load Balance</TableHead>
                <TableHead className="text-right pr-8">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => {
                const utilization = getUtilization(emp);
                const available = emp.max_capacity - emp.allocated_hours;
                
                return (
                  <TableRow key={emp.id} className="hover:bg-blue-50/20 transition-all duration-300 group">
                    <TableCell className="pl-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-500 group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-500">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="font-bold text-gray-900">{emp.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 opacity-40" />
                        {emp.role}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5 flex-wrap max-w-[280px]">
                        {emp.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-white border text-[10px] uppercase font-bold tracking-tight text-gray-500 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5 w-40">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                          <span>{emp.allocated_hours}H Used</span>
                          <span>{available}H Left</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              utilization >= 90 ? 'bg-red-500' : 
                              utilization >= 70 ? 'bg-amber-500' : 
                              'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <Badge className={`border-none ${
                        utilization >= 90 ? 'bg-red-100 text-red-700' : 
                        utilization >= 70 ? 'bg-amber-100 text-amber-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {utilization}% Cap
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredEmployees.length === 0 && (
            <div className="py-20 text-center text-muted-foreground italic">
              No talent profiles matching "{searchTerm}" were found in the system.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
