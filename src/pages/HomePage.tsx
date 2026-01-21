import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { EquipmentCard } from '@/components/equipment/EquipmentCard';
import { AddEquipmentSheet } from '@/components/equipment/AddEquipmentSheet';
import { api } from '@/lib/api-client';
import { Equipment } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Plus, Search, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
export function HomePage() {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { data: page, isLoading, error } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => api<{ items: Equipment[]; next: string | null }>('/api/equipment'),
  });
  const createMutation = useMutation({
    mutationFn: (newEq: any) => api<Equipment>('/api/equipment', {
      method: 'POST',
      body: JSON.stringify(newEq),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setIsAddSheetOpen(false);
      toast.success('Equipment added to the garage');
    },
    onError: () => toast.error('Failed to add equipment'),
  });
  const equipment = page?.items || [];
  const filteredEquipment = equipment.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.model.toLowerCase().includes(search.toLowerCase())
  );
  const chartData = useMemo(() => {
    // Group logs by machine to show spend per asset
    return equipment.map(e => ({
      name: e.name.split(' ')[0],
      spend: e.logs.reduce((sum, l) => sum + l.cost, 0),
    })).filter(d => d.spend > 0).sort((a, b) => b.spend - a.spend);
  }, [equipment]);
  return (
    <AppLayout container contentClassName="space-y-12">
      {/* Hero / Header Section */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground uppercase">
            THE <span className="text-orange-600">GARAGE</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-xl leading-relaxed">
            Industrial-grade fleet management. Monitor usage, track service intervals, and maintain peak performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="lg"
            className="h-16 px-10 bg-orange-600 hover:bg-orange-700 text-white font-black text-xl shadow-2xl shadow-orange-600/20 active:scale-95 transition-all rounded-2xl"
            onClick={() => setIsAddSheetOpen(true)}
          >
            <Plus className="mr-2 h-7 w-7 stroke-[3]" />
            ADD MACHINE
          </Button>
        </div>
      </section>
      {/* Analytics Insight */}
      {!isLoading && equipment.length > 0 && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-card border border-border/40 rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-tight">Maintenance Spend by Asset</h3>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={12} fontWeight="bold" axisLine={false} tickLine={false} />
                  <YAxis fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted)/0.3)'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="spend" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#F97316' : '#FB923C'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-6 rounded-3xl border border-border/40 bg-secondary/20 flex flex-col justify-between h-full">
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground pt-2">Efficiency Rating</h4>
                <p className="text-4xl font-black tracking-tighter">94%</p>
              </div>
              <p className="text-sm text-muted-foreground font-medium pt-4 border-t border-border/40">
                Fleet operational status is higher than industry average (82%).
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Summary Stat Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Fleet', value: equipment.length, color: 'bg-secondary' },
          { label: 'Operational', value: equipment.filter(e => e.status === 'operational').length, color: 'bg-green-500/10 text-green-600' },
          { label: 'Due Soon', value: equipment.filter(e => e.tasks.some(t => t.urgency === 'medium')).length, color: 'bg-orange-500/10 text-orange-600' },
          { label: 'Overdue', value: equipment.filter(e => e.tasks.some(t => t.urgency === 'overdue')).length, color: 'bg-red-500/10 text-red-600' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl border border-border/40 ${stat.color} flex flex-col justify-center transition-all hover:scale-[1.02]`}>
            <span className="text-4xl font-black tabular-nums tracking-tighter">{stat.value}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 mt-1">{stat.label}</span>
          </div>
        ))}
      </div>
      {/* Filters & Tools */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-secondary/30 rounded-2xl border border-border/40">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your workshop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-orange-600/50 text-base"
          />
        </div>
      </div>
      {/* Main Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-video w-full rounded-3xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Failed to load equipment</h2>
            <p className="text-muted-foreground">There was an error connecting to the workshop database.</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry Connection</Button>
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="py-32 border-2 border-dashed border-border/40 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-muted-foreground/30 uppercase tracking-tighter">THE GARAGE IS EMPTY</h2>
            <p className="text-lg text-muted-foreground max-w-sm mx-auto font-medium">
              Start your maintenance journey by adding your first piece of equipment.
            </p>
          </div>
          <Button
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 h-14 px-12 text-white font-black text-lg rounded-2xl"
            onClick={() => setIsAddSheetOpen(true)}
          >
            ADD YOUR FIRST MACHINE
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {filteredEquipment.map((item) => (
            <EquipmentCard key={item.id} equipment={item} />
          ))}
        </div>
      )}
      <AddEquipmentSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        onSubmit={(data) => createMutation.mutate(data)}
      />
    </AppLayout>
  );
}