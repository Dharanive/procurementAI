'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Car, Package, Truck, Users, Activity, Loader2, CheckCircle2, AlertTriangle, Sparkles, Brain } from 'lucide-react';
// @ts-ignore
import { toast } from 'sonner';
import { InventoryItem, Vendor } from '@/types';

export default function CarFactoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [orchestrating, setOrchestrating] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const fetchInventory = async () => {
    setLoading(true);
    const { data } = await supabase.from('inventory').select('*').order('current_stock', { ascending: true });
    if (data) setInventory(data as InventoryItem[]);
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

  return (
    <div className="container mx-auto p-6 pt-24 max-w-7xl space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
               <Car className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">TeslaCar Co. Monitoring</h1>
          </div>
          <p className="text-muted-foreground text-lg">Autonomous Inventory & Workforce Orchestration</p>
        </div>
        
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

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Inventory List */}
        <div className="lg:col-span-12">
           <Card className="border-none shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Inventory Hub</CardTitle>
                <CardDescription>Real-time car part stock levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-bold text-xs uppercase text-gray-400 mb-4 px-4">
                  <div>Item Name</div>
                  <div>Category</div>
                  <div>Stock Level</div>
                  <div>Threshold</div>
                  <div>Status</div>
                </div>
                <div className="space-y-3">
                  {inventory.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 items-center p-4 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-blue-100">
                      <div className="font-semibold text-gray-900">{item.item_name}</div>
                      <div className="text-sm text-gray-500">{item.category}</div>
                      <div className="font-mono">{item.current_stock} units</div>
                      <div className="text-sm text-gray-400">Reorder at {item.min_threshold}</div>
                      <div>
                        <Badge variant={item.status === 'In Stock' ? 'secondary' : item.status === 'Low Stock' ? 'outline' : 'destructive'} 
                               className={item.status === 'In Stock' ? 'bg-green-50 text-green-700 border-green-100' : item.status === 'Low Stock' ? 'border-orange-200 text-orange-600 bg-orange-50' : ''}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
           </Card>
        </div>

        {/* Workflow Results */}
        {lastResult && (
          <div className="lg:col-span-12 space-y-6 animate-in slide-in-from-bottom-8">
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
