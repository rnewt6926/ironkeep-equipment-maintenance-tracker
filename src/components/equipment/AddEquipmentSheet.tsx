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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EquipmentType } from '@shared/types';
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.string(),
  model: z.string().min(1, "Model is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  currentHours: z.coerce.number().min(0),
  purchaseDate: z.string(),
});
interface AddEquipmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}
export function AddEquipmentSheet({ open, onOpenChange, onSubmit }: AddEquipmentSheetProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "tractor",
      model: "",
      serialNumber: "",
      currentHours: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
    },
  });
  const equipmentTypes: { label: string; value: EquipmentType }[] = [
    { label: "Tractor", value: "tractor" },
    { label: "Mower", value: "mower" },
    { label: "Chainsaw", value: "chainsaw" },
    { label: "Handheld Tool", value: "handheld" },
    { label: "Vehicle", value: "vehicle" },
    { label: "Other", value: "other" },
  ];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md border-l border-border/40">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-bold">Add Equipment</SheetTitle>
          <SheetDescription>
            Enter the details for your new machine to start tracking its maintenance.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Machine Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Kubota Tractor" {...field} className="h-11 bg-secondary/50 border-border/40" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 bg-secondary/50 border-border/40">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {equipmentTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Current Hours</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} className="h-11 bg-secondary/50 border-border/40" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Model Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. L3301" {...field} className="h-11 bg-secondary/50 border-border/40" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Serial Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. KUB-12345" {...field} className="h-11 bg-secondary/50 border-border/40" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-6">
              <Button type="submit" className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg">
                Add Machine
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}