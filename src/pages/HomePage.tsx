import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { EquipmentCard } from '@/components/equipment/EquipmentCard';
import { AddEquipmentSheet } from '@/components/equipment/AddEquipmentSheet';
import { api } from '@/lib/api-client';
import { Equipment } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, Search, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
export function HomePage() {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
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
  return (
    <AppLayout container contentClassName="space-y-10">
      {/* Hero / Header Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            THE <span className="text-orange-600">GARAGE</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-xl">
            Manage your fleet and track vital maintenance intervals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            size="lg" 
            className="h-14 px-8 bg-orange-600 hover:bg-orange-700 text-white font-black text-lg shadow-xl shadow-orange-600/20 active:scale-95 transition-all"
            onClick={() => setIsAddSheetOpen(true)}
          >
            <Plus className="mr-2 h-6 w-6 stroke-[3]" />
            ADD MACHINE
          </Button>
        </div>
      </section>
      {/* Summary Stat Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Fleet', value: equipment.length, color: 'bg-secondary' },
          { label: 'Operational', value: equipment.filter(e => e.status === 'operational').length, color: 'bg-green-500/10 text-green-600' },
          { label: 'Due Soon', value: 2, color: 'bg-orange-500/10 text-orange-600' },
          { label: 'Overdue', value: 1, color: 'bg-red-500/10 text-red-600' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border border-border/40 ${stat.color} flex flex-col justify-center`}>
            <span className="text-3xl font-black tabular-nums">{stat.value}</span>
            <span className="text-xs font-bold uppercase tracking-widest opacity-70">{stat.label}</span>
          </div>
        ))}
      </div>
      {/* Filters & Tools */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-secondary/30 rounded-2xl border border-border/40">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search fleet..." 
            className="pl-10 h-11 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-orange-600/50"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="ghost" size="sm" className="h-10 text-xs font-bold uppercase tracking-wider">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Grid View
          </Button>
        </div>
      </div>
      {/* Main Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-video w-full rounded-2xl" />
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
      ) : equipment.length === 0 ? (
        <div className="py-32 border-2 border-dashed border-border/40 rounded-3xl flex flex-col items-center justify-center text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-muted-foreground/50">GARAGE IS EMPTY</h2>
            <p className="text-lg text-muted-foreground max-w-sm mx-auto">
              Start your maintenance journey by adding your first piece of equipment.
            </p>
          </div>
          <Button 
            size="lg" 
            className="bg-orange-600 hover:bg-orange-700 h-12 px-10 text-white font-bold"
            onClick={() => setIsAddSheetOpen(true)}
          >
            ADD YOUR FIRST MACHINE
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
          {equipment.map((item) => (
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