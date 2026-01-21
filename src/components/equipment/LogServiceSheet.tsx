import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Equipment } from '@shared/types';
const logSchema = z.object({
  hoursAtService: z.coerce.number().min(0, "Hours cannot be negative"),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(3, "Description is too short"),
  cost: z.coerce.number().min(0),
  performedBy: z.string().min(1, "Name is required"),
});
type LogFormValues = z.infer<typeof logSchema>;
interface LogServiceSheetProps {
  equipmentId: string;
  taskId: string;
  taskTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentHours: number;
}
export function LogServiceSheet({ 
  equipmentId, 
  taskId, 
  taskTitle, 
  open, 
  onOpenChange,
  currentHours 
}: LogServiceSheetProps) {
  const queryClient = useQueryClient();
  const form = useForm<LogFormValues>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      hoursAtService: currentHours,
      date: new Date().toISOString().split('T')[0],
      description: `Completed ${taskTitle}`,
      cost: 0,
      performedBy: "",
    },
  });
  const mutation = useMutation({
    mutationFn: (data: LogFormValues) => 
      api<Equipment>(`/api/equipment/${equipmentId}/log`, {
        method: 'POST',
        body: JSON.stringify({ ...data, taskId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', equipmentId] });
      toast.success("Service log recorded successfully");
      onOpenChange(false);
      form.reset();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to record service log");
    }
  });
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md border-l border-border/40">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-bold">Log Service</SheetTitle>
          <SheetDescription>
            Record completion of: <span className="text-orange-600 font-bold">{taskTitle}</span>
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hoursAtService"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Engine Hours</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} className="h-11 bg-secondary/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="h-11 bg-secondary/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Service Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What was done?" {...field} className="min-h-[100px] bg-secondary/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Cost ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} className="h-11 bg-secondary/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="performedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Performed By</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} className="h-11 bg-secondary/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="pt-6">
              <Button 
                type="submit" 
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Recording..." : "Record Service"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}