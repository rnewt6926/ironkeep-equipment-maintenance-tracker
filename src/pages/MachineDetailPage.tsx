import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import { Equipment, MaintenanceTask, MaintenanceLog } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Clock, Calendar, Wrench, History, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LogServiceSheet } from '@/components/equipment/LogServiceSheet';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
export function MachineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<{ id: string; title: string } | null>(null);
  const { data: machine, isLoading, error } = useQuery({
    queryKey: ['equipment', id],
    queryFn: () => api<Equipment>(`/api/equipment/${id}`),
    enabled: !!id,
  });
  if (isLoading) return (
    <AppLayout container>
      <div className="space-y-8">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    </AppLayout>
  );
  if (error || !machine) return (
    <AppLayout container>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">Equipment Not Found</h2>
        <Button variant="link" onClick={() => navigate('/')}>Back to Garage</Button>
      </div>
    </AppLayout>
  );
  return (
    <AppLayout container>
      <div className="space-y-10">
        {/* Breadcrumb / Back Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ChevronLeft className="h-6 w-6" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">{machine.name}</h1>
            <p className="text-muted-foreground font-mono text-sm">{machine.model} • SN: {machine.serialNumber}</p>
          </div>
        </div>
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative aspect-video rounded-3xl overflow-hidden bg-secondary border border-border/40 group">
            {machine.image ? (
              <img src={machine.image} alt={machine.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No image available</div>
            )}
            <div className="absolute top-6 left-6 flex gap-2">
              <Badge className={cn(
                "px-4 py-1.5 text-sm font-bold capitalize",
                machine.status === 'operational' ? "bg-green-600" : machine.status === 'maintenance' ? "bg-orange-600" : "bg-red-600"
              )}>
                {machine.status}
              </Badge>
            </div>
          </div>
          <div className="space-y-6">
            <Card className="bg-orange-600 text-white border-none shadow-xl shadow-orange-600/20">
              <CardContent className="p-8 space-y-2">
                <Clock className="h-8 w-8 opacity-80" />
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-widest opacity-80">Accumulated Hours</p>
                  <p className="text-5xl font-black tabular-nums tracking-tighter">{machine.currentHours.toFixed(1)}</p>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-card/50 border-border/40">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Purchase Date</p>
                    <p className="font-bold">{format(new Date(machine.purchaseDate), 'PPP')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        {/* Content Tabs */}
        <Tabs defaultValue="maintenance" className="w-full">
          <TabsList className="bg-secondary/50 p-1 rounded-xl w-full sm:w-auto h-auto">
            <TabsTrigger value="maintenance" className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all">
              <Wrench className="h-4 w-4 mr-2" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="specs" className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all">
              <Info className="h-4 w-4 mr-2" />
              Specs
            </TabsTrigger>
          </TabsList>
          <TabsContent value="maintenance" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {machine.tasks.map((task) => {
                const progress = task.nextDueHours 
                  ? Math.min(100, (machine.currentHours / task.nextDueHours) * 100) 
                  : 0;
                return (
                  <Card key={task.id} className="border-border/40 hover:border-orange-600/20 transition-all">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-bold">{task.title}</CardTitle>
                        <Badge variant={task.urgency === 'overdue' ? 'destructive' : 'secondary'} className="capitalize font-bold">
                          {task.urgency}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold uppercase tracking-wider text-muted-foreground">
                          <span>Usage Lifecycle</span>
                          <span>Next Service: {task.nextDueHours?.toFixed(1)} hrs</span>
                        </div>
                        <Progress 
                          value={progress} 
                          className={cn(
                            "h-3 bg-muted",
                            task.urgency === 'overdue' ? "[&>div]:bg-red-500" :
                            task.urgency === 'medium' ? "[&>div]:bg-orange-500" : "[&>div]:bg-green-500"
                          )} 
                        />
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="text-sm">
                          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Last Performed</p>
                          <p className="font-bold">{task.lastPerformedHours ?? 0} hrs / {task.lastPerformedDate ? format(new Date(task.lastPerformedDate), 'PP') : 'Never'}</p>
                        </div>
                        <Button 
                          className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                          onClick={() => setSelectedTask({ id: task.id, title: task.title })}
                        >
                          Log Service
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          <TabsContent value="history" className="mt-8">
            <Card className="border-border/40">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Hours</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Performed By</th>
                        <th className="px-6 py-4 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {machine.logs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                            No service history recorded for this machine.
                          </td>
                        </tr>
                      ) : (
                        machine.logs.map((log) => (
                          <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-6 py-4 font-bold">{format(new Date(log.date), 'PP')}</td>
                            <td className="px-6 py-4 font-mono text-sm">{log.hoursAtService.toFixed(1)} hrs</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{log.description}</td>
                            <td className="px-6 py-4 text-sm font-medium">{log.performedBy}</td>
                            <td className="px-6 py-4 text-right font-bold text-orange-600">${log.cost.toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="specs" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Manufacturer', value: machine.name.split(' ')[0], icon: Package },
                { label: 'Model Number', value: machine.model, icon: Info },
                { label: 'Serial Number', value: machine.serialNumber, icon: Wrench },
                { label: 'Purchase Date', value: machine.purchaseDate, icon: Calendar },
                { label: 'Status', value: machine.status, icon: CheckCircle2 },
              ].map((spec, i) => (
                <Card key={i} className="border-border/40">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                      <spec.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{spec.label}</p>
                      <p className="font-bold uppercase tracking-tight">{spec.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {selectedTask && machine && (
        <LogServiceSheet 
          open={!!selectedTask} 
          onOpenChange={(open) => !open && setSelectedTask(null)}
          equipmentId={machine.id}
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
          currentHours={machine.currentHours}
        />
      )}
    </AppLayout>
  );
}
function Package(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" /></svg>
  );
}