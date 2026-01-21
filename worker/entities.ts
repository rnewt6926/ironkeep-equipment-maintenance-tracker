import { IndexedEntity } from "./core-utils";
import type { Equipment, User, MaintenanceLog, MaintenanceTask } from "@shared/types";
import { MOCK_EQUIPMENT, MOCK_USERS } from "@shared/mock-data";
export class EquipmentEntity extends IndexedEntity<Equipment> {
  static readonly entityName = "equipment";
  static readonly indexName = "equipment_index";
  static readonly initialState: Equipment = {
    id: "",
    name: "",
    type: "other",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    currentHours: 0,
    status: "operational",
    tasks: [],
    logs: []
  };
  static seedData = MOCK_EQUIPMENT;
  async updateHours(hours: number): Promise<Equipment> {
    return this.mutate(s => {
      const nextHours = Math.max(s.currentHours, hours);
      const updatedTasks = s.tasks.map(t => this.calculateUrgency(t, nextHours));
      return { ...s, currentHours: nextHours, tasks: updatedTasks };
    });
  }
  async addLog(logData: Omit<MaintenanceLog, 'id'> & { taskId?: string }): Promise<Equipment> {
    return this.mutate(s => {
      const { taskId, ...logEntry } = logData;
      const newLog: MaintenanceLog = { 
        ...logEntry, 
        id: crypto.randomUUID(),
        equipmentId: this.id 
      };
      const nextHours = Math.max(s.currentHours, logEntry.hoursAtService);
      const updatedTasks = s.tasks.map(t => {
        if (t.id === taskId) {
          const nextDue = t.intervalHours ? logEntry.hoursAtService + t.intervalHours : undefined;
          const updatedTask: MaintenanceTask = {
            ...t,
            lastPerformedHours: logEntry.hoursAtService,
            lastPerformedDate: logEntry.date,
            nextDueHours: nextDue,
            // Urgency will be recalculated below
          };
          return this.calculateUrgency(updatedTask, nextHours);
        }
        return this.calculateUrgency(t, nextHours);
      });
      return {
        ...s,
        currentHours: nextHours,
        logs: [newLog, ...s.logs],
        tasks: updatedTasks
      };
    });
  }
  private calculateUrgency(task: MaintenanceTask, currentHours: number): MaintenanceTask {
    if (!task.nextDueHours) return { ...task, urgency: 'low' };
    const diff = task.nextDueHours - currentHours;
    let urgency: MaintenanceTask['urgency'] = 'low';
    if (diff <= 0) {
      urgency = 'overdue';
    } else if (diff <= 5) {
      urgency = 'high';
    } else if (diff <= 15) {
      urgency = 'medium';
    }
    return { ...task, urgency };
  }
}
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}