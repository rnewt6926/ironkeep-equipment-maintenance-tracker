import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { api } from '@/lib/api-client';
import { Equipment, MaintenanceLog } from '@shared/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, History, DollarSign, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
interface LogWithMachine extends MaintenanceLog {
  machineName: string;
}
export function HistoryPage() {
  const [search, setSearch] = useState('');
  const { data: page, isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => api<{ items: Equipment[]; next: string | null }>('/api/equipment'),
  });
  const allLogs = useMemo(() => {
    if (!page?.items) return [];
    const flattened: LogWithMachine[] = [];
    page.items.forEach(machine => {
      machine.logs.forEach(log => {
        flattened.push({
          ...log,
          machineName: machine.name
        });
      });
    });
    return flattened.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [page?.items]);
  const filteredLogs = allLogs.filter(l => 
    l.description.toLowerCase().includes(search.toLowerCase()) || 
    l.machineName.toLowerCase().includes(search.toLowerCase()) ||
    l.performedBy.toLowerCase().includes(search.toLowerCase())
  );
  const totalSpend = filteredLogs.reduce((sum, log) => sum + log.cost, 0);
  return (
    <AppLayout container>
      <div className="space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase">
              Service <span className="text-orange-600">History</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              A comprehensive audit of all work performed on your fleet.
            </p>
          </div>
          <Card className="bg-orange-600 text-white border-none shadow-xl shadow-orange-600/20">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">Total Fleet Spend</p>
                <p className="text-2xl font-black tabular-nums">${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </CardContent>
          </Card>
        </header>
        <div className="flex items-center p-2 bg-secondary/30 rounded-2xl border border-border/40">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search history by keyword, machine or technician..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-orange-600/50"
            />
          </div>
        </div>
        <Card className="border-border/40 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Date</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Machine</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Service Performed</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Technician</TableHead>
                  <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                      No matching records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-bold">{format(new Date(log.date), 'PP')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-3 w-3 text-orange-600" />
                          <span className="font-bold uppercase tracking-tight text-xs">{log.machineName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">{log.description}</TableCell>
                      <TableCell className="text-sm font-medium">{log.performedBy}</TableCell>
                      <TableCell className="text-right font-black text-orange-600">
                        ${log.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}