'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { Car, Package, Truck, Users, Activity, Loader2, CheckCircle2, AlertTriangle, Sparkles, Brain, Plus } from 'lucide-react';
// @ts-ignore
import { toast } from 'sonner';
import { InventoryItem, Vendor } from '@/types';

export default function CarFactoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [orchestrating, setOrchestrating] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Add Inventory Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    current_stock: '',
    min_threshold: '',
    unit_price: ''
  });

  const fetchInventory = async () => {
    setLoading(true);
    const { data } = await supabase.from('inventory').select('*').order('current_stock', { ascending: true });
    if (data) {
      setInventory(data as InventoryItem[]);
      setCurrentPage(1); // Reset to first page on refresh
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const runAutonomousWorkflow = async () => {
    setOrchestrating(true);
    setLastResult(null);
    try {
      const response = await fetch('/api/car-factory', { method: 'POST' });
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || 'Autonomous Agent failed.');

      setLastResult(result);
      toast.success("Autonomous workflow completed!");
      fetchInventory(); // Refresh stock
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setOrchestrating(false);
    }
  };

  const handleAddInventory = async () => {
    // Validation
    if (!formData.item_name || !formData.category || !formData.current_stock || !formData.min_threshold || !formData.unit_price) {
      toast.error("Please fill in all fields.");
      return;
    }

    const currentStock = parseInt(formData.current_stock);
    const minThreshold = parseInt(formData.min_threshold);
    const unitPrice = parseFloat(formData.unit_price);

    if (isNaN(currentStock) || currentStock < 0) {
      toast.error("Current stock must be a valid number.");
      return;
    }

    if (isNaN(minThreshold) || minThreshold < 0) {
      toast.error("Minimum threshold must be a valid number.");
      return;
    }

    if (isNaN(unitPrice) || unitPrice < 0) {
      toast.error("Unit price must be a valid number.");
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert({
          item_name: formData.item_name,
          category: formData.category,
          current_stock: currentStock,
          min_threshold: minThreshold,
          unit_price: unitPrice
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Inventory item added successfully!", {
        description: `${formData.item_name} has been added to inventory.`
      });

      // Reset form
      setFormData({
        item_name: '',
        category: '',
        current_stock: '',
        min_threshold: '',
        unit_price: ''
      });

      setDialogOpen(false);
      fetchInventory(); // Refresh inventory list
    } catch (error: any) {
      console.error('Error adding inventory:', error);
      toast.error(`Failed to add inventory: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(inventory.length / itemsPerPage);
  const currentInventory = inventory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="container mx-auto p-6 pt-24 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
               <Car className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">TeslaCar Co. Monitoring</h1>
          </div>
          <p className="text-muted-foreground text-lg">Autonomous Inventory & Workforce Orchestration</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 shadow-xl shadow-green-200"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Inventory
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Add a new car part or component to the inventory system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="item_name">Item Name *</Label>
                  <Input
                    id="item_name"
                    placeholder="e.g., V8 Engine Block"
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    disabled={saving}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    disabled={saving}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engine">Engine</SelectItem>
                      <SelectItem value="Wheels">Wheels</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Interior">Interior</SelectItem>
                      <SelectItem value="Exterior">Exterior</SelectItem>
                      <SelectItem value="Transmission">Transmission</SelectItem>
                      <SelectItem value="Brakes">Brakes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current_stock">Current Stock *</Label>
                    <Input
                      id="current_stock"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.current_stock}
                      onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="min_threshold">Min Threshold *</Label>
                    <Input
                      id="min_threshold"
                      type="number"
                      min="0"
                      placeholder="5"
                      value={formData.min_threshold}
                      onChange={(e) => setFormData({ ...formData, min_threshold: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit_price">Unit Price ($) *</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    disabled={saving}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setFormData({
                      item_name: '',
                      category: '',
                      current_stock: '',
                      min_threshold: '',
                      unit_price: ''
                    });
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddInventory}
                  disabled={saving}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Add to Inventory</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button 
            size="lg" 
            onClick={runAutonomousWorkflow} 
            disabled={orchestrating}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 shadow-xl shadow-blue-200"
          >
            {orchestrating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Agents Thinking...</>
            ) : (
              <><Brain className="w-4 h-4 mr-2" /> Trigger Autonomous Review</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-blue-50/50">
          <CardHeader className="pb-2">
             <CardDescription className="flex items-center gap-2"><Package className="w-4 h-4" /> Total Components</CardDescription>
             <CardTitle className="text-3xl font-bold">{inventory.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-orange-50/50">
          <CardHeader className="pb-2">
             <CardDescription className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Low Stock Items</CardDescription>
             <CardTitle className="text-3xl font-bold text-orange-600">{inventory.filter(i => i.status !== 'In Stock').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-green-50/50">
          <CardHeader className="pb-2">
             <CardDescription className="flex items-center gap-2"><Activity className="w-4 h-4" /> Agent Status</CardDescription>
             <CardTitle className="text-3xl font-bold text-green-600">Active</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Inventory List */}
      <Card className="border-none shadow-2xl overflow-hidden bg-white">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Inventory Hub</CardTitle>
              <CardDescription>Real-time car part stock levels</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-white">Total: {inventory.length}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/30">
              <TableRow>
                <TableHead className="pl-8 py-5">Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead className="text-right pr-8">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center text-muted-foreground italic">
                    No parts found in the local inventory.
                  </TableCell>
                </TableRow>
              ) : (
                currentInventory.map((item) => (
                  <TableRow key={item.id} className="hover:bg-blue-50/20 transition-all duration-300 group">
                    <TableCell className="pl-8 py-6">
                      <div className="font-bold text-gray-900">{item.item_name}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium">
                      {item.category}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-base font-black text-gray-900">
                        {item.current_stock} units
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        Reorder at {item.min_threshold}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <Badge 
                        className={`border-none ${
                          item.status === 'In Stock' 
                            ? 'bg-green-100 text-green-700' 
                            : item.status === 'Low Stock' 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.status}
                      </Badge>
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
                Showing <span className="text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, inventory.length)}</span> of <span className="text-gray-900">{inventory.length}</span> components
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

      <div className="grid gap-8 lg:grid-cols-12">

        {/* Workflow Results */}
        {lastResult && (
          <div className="space-y-6 animate-in slide-in-from-bottom-8">
             <h2 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="w-6 h-6 text-blue-600" /> Autonomous Agent Log</h2>
             
             <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-none shadow-2xl bg-gradient-to-br from-indigo-900 to-blue-900 text-white overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Truck className="w-32 h-32" />
                   </div>
                   <CardHeader>
                      <Badge className="w-fit bg-blue-500/20 text-blue-200 border-none">Step 1: AI Sourcing</Badge>
                      <CardTitle className="text-2xl">Recommended Supplier</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                         <div className="text-sm text-blue-200 uppercase font-bold tracking-widest">Selected Vendor</div>
                         <div className="text-2xl font-black">{lastResult.recommendedVendor?.best_vendor_name}</div>
                      </div>
                      <div className="italic text-blue-100/80 leading-relaxed">
                         "{lastResult.recommendedVendor?.reasoning}"
                      </div>
                   </CardContent>
                </Card>

                <Card className="border-none shadow-2xl bg-white overflow-hidden border-l-4 border-l-green-500">
                   <CardHeader>
                      <Badge className="w-fit bg-green-100 text-green-700 border-none">Step 2: AI Assignment</Badge>
                      <CardTitle className="text-2xl">Workforce Allocation</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                         <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                            {lastResult.assignmentResult?.best_employee_name?.charAt(0)}
                         </div>
                         <div>
                            <div className="text-xs text-gray-400 font-bold uppercase">Assigned Talent</div>
                            <div className="text-xl font-extrabold">{lastResult.assignmentResult?.best_employee_name}</div>
                         </div>
                      </div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl italic">
                         {lastResult.assignmentResult?.reasoning}
                      </div>
                   </CardContent>
                </Card>
             </div>

             <Card className="bg-gray-900 border-none text-gray-400 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2 mb-4 font-mono text-sm text-blue-400">
                   <Activity className="w-4 h-4" /> AGENT_EXECUTION_TRACE
                </div>
                <div className="space-y-2 font-mono text-xs">
                   {lastResult.logs.map((log: string, i: number) => (
                     <div key={i} className="flex gap-4">
                        <span className="text-gray-600">[{i+1}]</span>
                        <span className={log.includes('Detect') ? 'text-orange-400' : log.includes('Recommend') ? 'text-blue-400' : 'text-green-400'}>{log}</span>
                     </div>
                   ))}
                </div>
             </Card>
          </div>
        )}
      </div>
    </div>
  );
}
