import { IndexedEntity } from "./core-utils";
import type { Equipment, User, Chat, ChatMessage } from "@shared/types";
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
      // Logic for calculating urgency would happen here in a real app
      return { ...s, currentHours: nextHours };
    });
  }
  async addLog(log: Omit<typeof EquipmentEntity.initialState.logs[0], 'id'>): Promise<Equipment> {
    return this.mutate(s => ({
      ...s,
      logs: [...s.logs, { ...log, id: crypto.randomUUID() }]
    }));
  }
}
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
export type ChatBoardState = Chat & { messages: ChatMessage[] };
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  static seedData = [];
  async listMessages(): Promise<ChatMessage[]> {
    const { messages } = await this.getState();
    return messages;
  }
  async sendMessage(userId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = { id: crypto.randomUUID(), chatId: this.id, userId, text, ts: Date.now() };
    await this.mutate(s => ({ ...s, messages: [...s.messages, msg] }));
    return msg;
  }
}