import React from 'react';
import { Equipment } from '@shared/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle2, MoreHorizontal, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
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
  const serviceProgress = nextService?.intervalHours && nextService.nextDueHours
    ? Math.min(100, Math.max(0, (equipment.currentHours / nextService.nextDueHours) * 100))
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
          <Link to={`/equipment/${equipment.id}`} className="hover:underline decoration-orange-600 underline-offset-4">
            <h3 className="text-xl font-bold tracking-tight text-foreground line-clamp-1">{equipment.name}</h3>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{equipment.model}</p>
          </Link>
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
              className={cn(
                "h-2 bg-muted",
                nextService.urgency === 'overdue' ? "[&>div]:bg-red-500" :
                nextService.urgency === 'medium' ? "[&>div]:bg-orange-500" : "[&>div]:bg-green-500"
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
        <Button asChild variant="outline" className="w-full font-bold h-10 border-border/60">
          <Link to={`/equipment/${equipment.id}`}>Details</Link>
        </Button>
        <Button className="w-full font-bold h-10 bg-orange-600 hover:bg-orange-700 text-white">Log Service</Button>
      </CardFooter>
    </Card>
  );
}