import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import { Equipment, MaintenanceTask } from '@shared/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Clock, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LogServiceSheet } from '@/components/equipment/LogServiceSheet';
import { cn } from '@/lib/utils';
interface TaskWithMachine extends MaintenanceTask {
  machineName: string;
  machineId: string;
  currentHours: number;
}
export function SchedulePage() {
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<TaskWithMachine | null>(null);
  const { data: page, isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => api<{ items: Equipment[]; next: string | null }>('/api/equipment'),
  });
  const allTasks = useMemo(() => {
    if (!page?.items) return [];
    const flattened: TaskWithMachine[] = [];
    page.items.forEach(machine => {
      machine.tasks.forEach(task => {
        flattened.push({
          ...task,
          machineName: machine.name,
          machineId: machine.id,
          currentHours: machine.currentHours
        });
      });
    });
    return flattened.sort((a, b) => {
      const urgencyOrder = { overdue: 0, high: 1, medium: 2, low: 3 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return (a.nextDueHours || 0) - (b.nextDueHours || 0);
    });
  }, [page?.items]);
  const filteredTasks = allTasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.machineName.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <AppLayout container>
      <div className="space-y-10">
        <header className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase">
            Maintenance <span className="text-orange-600">Schedule</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Aggregated pending tasks across your entire fleet.
          </p>
        </header>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-2 bg-secondary/30 rounded-2xl border border-border/40">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by task or machine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-orange-600/50"
            />
          </div>
          <Button variant="outline" className="h-11 gap-2 font-bold">
            <Filter className="h-4 w-4" />
            Filter Urgency
          </Button>
        </div>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-border/40 rounded-3xl">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold">All clear!</h3>
            <p className="text-muted-foreground">No pending tasks match your criteria.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <Card key={`${task.machineId}-${task.id}`} className="group hover:border-orange-600/20 transition-all">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-5">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                      task.urgency === 'overdue' ? "bg-red-500/10 text-red-600" :
                      task.urgency === 'high' ? "bg-orange-500/10 text-orange-600" : "bg-secondary"
                    )}>
                      {task.urgency === 'overdue' ? <AlertTriangle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h4 className="font-bold text-lg truncate">{task.title}</h4>
                      <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{task.machineName}</p>
                    </div>
                    <div className="flex flex-col items-center sm:items-end gap-1">
                      <Badge className={cn(
                        "capitalize font-bold",
                        task.urgency === 'overdue' ? "bg-red-600" :
                        task.urgency === 'high' ? "bg-orange-600" : "bg-secondary text-foreground"
                      )}>
                        {task.urgency}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">
                        Next Due: {task.nextDueHours?.toFixed(1) ?? '--'} hrs
                      </span>
                    </div>
                    <div className="shrink-0 w-full sm:w-auto pt-4 sm:pt-0">
                      <Button 
                        className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold"
                        onClick={() => setSelectedTask(task)}
                      >
                        Log Service
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {selectedTask && (
        <LogServiceSheet
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          equipmentId={selectedTask.machineId}
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
          currentHours={selectedTask.currentHours}
        />
      )}
    </AppLayout>
  );
}