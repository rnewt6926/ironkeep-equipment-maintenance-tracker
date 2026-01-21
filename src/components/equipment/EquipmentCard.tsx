import React from 'react';
import { Equipment } from '@shared/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertTriangle, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
interface EquipmentCardProps {
  equipment: Equipment;
}
export function EquipmentCard({ equipment }: EquipmentCardProps) {
  const nextService = equipment.tasks.reduce((prev, curr) => {
    if (!prev) return curr;
    if (!curr.nextDueHours) return prev;
    return curr.nextDueHours < (prev.nextDueHours || Infinity) ? curr : prev;
  }, equipment.tasks[0]);
  const hoursRemaining = nextService?.nextDueHours 
    ? Math.max(0, nextService.nextDueHours - equipment.currentHours) 
    : null;
  const serviceProgress = nextService?.intervalHours 
    ? Math.min(100, (equipment.currentHours / nextService.nextDueHours!) * 100)
    : 0;
  return (
    <Card className="group overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-500/20">
      <div className="relative aspect-[16/9] overflow-hidden">
        {equipment.image ? (
          <img 
            src={equipment.image} 
            alt={equipment.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <Badge className={cn(
            "capitalize font-bold px-3 py-1",
            equipment.status === 'operational' ? "bg-green-600" : 
            equipment.status === 'maintenance' ? "bg-orange-600" : "bg-red-600"
          )}>
            {equipment.status}
          </Badge>
          <div className="flex items-center gap-1.5 text-white">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-sm font-bold">{equipment.currentHours.toFixed(1)} hrs</span>
          </div>
        </div>
      </div>
      <CardHeader className="p-5 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground line-clamp-1">{equipment.name}</h3>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{equipment.model}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-3 space-y-4">
        {nextService ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span>Next: {nextService.title}</span>
              <span className={cn(
                nextService.urgency === 'overdue' ? "text-red-500" : 
                nextService.urgency === 'medium' ? "text-orange-500" : "text-green-500"
              )}>
                {hoursRemaining !== null ? `${hoursRemaining.toFixed(1)} hrs left` : 'Due'}
              </span>
            </div>
            <Progress 
              value={serviceProgress} 
              className="h-2 bg-muted"
              indicatorClassName={cn(
                nextService.urgency === 'overdue' ? "bg-red-500" : 
                nextService.urgency === 'medium' ? "bg-orange-500" : "bg-green-500"
              )}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground italic">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            No pending tasks
          </div>
        )}
      </CardContent>
      <CardFooter className="p-5 pt-0 grid grid-cols-2 gap-3">
        <Button variant="outline" className="w-full font-bold h-10 border-border/60">Details</Button>
        <Button className="w-full font-bold h-10 bg-orange-600 hover:bg-orange-700 text-white">Log Service</Button>
      </CardFooter>
    </Card>
  );
}
function Package(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  );
}