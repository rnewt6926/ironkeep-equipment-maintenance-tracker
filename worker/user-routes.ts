import { Hono } from "hono";
import type { Env } from './core-utils';
import { EquipmentEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // EQUIPMENT
  app.get('/api/equipment', async (c) => {
    await EquipmentEntity.ensureSeed(c.env);
    const cursor = c.req.query('cursor');
    const limit = c.req.query('limit');
    const page = await EquipmentEntity.list(c.env, cursor ?? null, limit ? parseInt(limit) : 50);
    return ok(c, page);
  });
  app.post('/api/equipment', async (c) => {
    const data = await c.req.json();
    if (!data.name || !data.type) return bad(c, 'name and type required');
    const equipment = await EquipmentEntity.create(c.env, {
      ...data,
      id: crypto.randomUUID(),
      tasks: [],
      logs: [],
      status: 'operational',
      currentHours: data.currentHours || 0
    });
    return ok(c, equipment);
  });
  app.get('/api/equipment/:id', async (c) => {
    const entity = new EquipmentEntity(c.env, c.req.param('id'));
    if (!await entity.exists()) return notFound(c, 'Equipment not found');
    return ok(c, await entity.getState());
  });
  app.patch('/api/equipment/:id/hours', async (c) => {
    const { hours } = await c.req.json();
    if (typeof hours !== 'number') return bad(c, 'hours must be a number');
    const entity = new EquipmentEntity(c.env, c.req.param('id'));
    if (!await entity.exists()) return notFound(c, 'Equipment not found');
    return ok(c, await entity.updateHours(hours));
  });
  app.delete('/api/equipment/:id', async (c) => {
    return ok(c, { deleted: await EquipmentEntity.delete(c.env, c.req.param('id')) });
  });
}