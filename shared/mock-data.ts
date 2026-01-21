import { Equipment, User, Chat, ChatMessage } from './types';
export const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: 'eq-1',
    name: 'Kubota L3301',
    type: 'tractor',
    model: 'L3301HST',
    serialNumber: 'KUB-7721A',
    purchaseDate: '2022-03-15',
    currentHours: 145.5,
    status: 'operational',
    image: 'https://images.unsplash.com/photo-1594913785162-e6785b493bd2?auto=format&fit=crop&q=80&w=400',
    tasks: [
      {
        id: 'task-1',
        title: 'Engine Oil Change',
        intervalHours: 50,
        lastPerformedHours: 100,
        nextDueHours: 150,
        urgency: 'medium'
      },
      {
        id: 'task-2',
        title: 'Grease Chassis Fittings',
        intervalHours: 10,
        lastPerformedHours: 140,
        nextDueHours: 150,
        urgency: 'medium'
      }
    ],
    logs: []
  },
  {
    id: 'eq-2',
    name: 'Stihl MS 261',
    type: 'chainsaw',
    model: 'MS 261 C-M',
    serialNumber: 'STI-99021',
    purchaseDate: '2023-01-10',
    currentHours: 22.0,
    status: 'operational',
    image: 'https://images.unsplash.com/photo-1622348735048-ef0021653f54?auto=format&fit=crop&q=80&w=400',
    tasks: [
      {
        id: 'task-3',
        title: 'Sharpen Chain',
        intervalHours: 2,
        lastPerformedHours: 21,
        nextDueHours: 23,
        urgency: 'low'
      },
      {
        id: 'task-4',
        title: 'Replace Air Filter',
        intervalHours: 50,
        lastPerformedHours: 0,
        nextDueHours: 50,
        urgency: 'low'
      }
    ],
    logs: []
  },
  {
    id: 'eq-3',
    name: 'Bad Boy ZT Elite',
    type: 'mower',
    model: 'ZT Elite 60"',
    serialNumber: 'BB-6600',
    purchaseDate: '2021-05-20',
    currentHours: 312.8,
    status: 'maintenance',
    image: 'https://images.unsplash.com/photo-1592910129841-3b8d41e7d82b?auto=format&fit=crop&q=80&w=400',
    tasks: [
      {
        id: 'task-5',
        title: 'Hydraulic Fluid Service',
        intervalHours: 300,
        lastPerformedHours: 0,
        nextDueHours: 300,
        urgency: 'overdue'
      }
    ],
    logs: []
  }
];
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Master Mechanic' }
];
export const MOCK_CHATS: Chat[] = [];
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [];