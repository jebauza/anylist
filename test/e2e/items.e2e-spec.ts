import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { TestAppModule } from './setup/test-app.module';
import { gqlReq, isAccessDenied, FAKE_UUID } from './helpers/gql';
import { ensureTestSchema, cleanupUsers } from './helpers/db';
import { makeUser, makeItem } from './helpers/factories';
import { SIGNUP } from './operations/auth.operations';
import {
  CREATE_ITEM,
  ITEMS,
  ITEM,
  UPDATE_ITEM,
  REMOVE_ITEM,
} from './operations/items.operations';

describe('ItemsResolver (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let authToken: string;
  let userId: string;
  let itemId: string;

  const user = makeUser('items');

  beforeAll(async () => {
    await ensureTestSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    const { body } = await gqlReq(app, SIGNUP, { signupInput: user });
    authToken = body.data.signup.token as string;
    userId = body.data.signup.user.id as string;
  }, 35_000);

  afterAll(async () => {
    await cleanupUsers(dataSource, [userId]);
    await app.close();
  });

  // ── createItem mutation ──────────────────────────────────────────────────────

  describe('createItem mutation', () => {
    it('creates an item successfully', async () => {
      const itemData = makeItem();

      const { body } = await gqlReq(
        app,
        CREATE_ITEM,
        { createItemInput: itemData },
        authToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.createItem).toMatchObject({
        name: itemData.name.toLowerCase(),
        unit: itemData.unit,
      });
      expect(body.data.createItem.id).toBeDefined();

      itemId = body.data.createItem.id as string;
    });

    it('denies access without a token', async () => {
      const res = await gqlReq(app, CREATE_ITEM, {
        createItemInput: makeItem(),
      });
      expect(isAccessDenied(res, 'createItem')).toBe(true);
    });
  });

  // ── items query ──────────────────────────────────────────────────────────────

  describe('items query', () => {
    it('returns the current user items list', async () => {
      const { body } = await gqlReq(
        app,
        ITEMS,
        { limit: 50, offset: 0 },
        authToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(Array.isArray(body.data.items)).toBe(true);
      expect(body.data.items.length).toBeGreaterThanOrEqual(1);
    });

    it('returns items matching a search term', async () => {
      const { body } = await gqlReq(
        app,
        ITEMS,
        { search: 'e2e-items' },
        authToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(Array.isArray(body.data.items)).toBe(true);
    });

    it('denies access without a token', async () => {
      const res = await gqlReq(app, ITEMS, { limit: 10 });
      expect(isAccessDenied(res, 'items')).toBe(true);
    });
  });

  // ── item query ───────────────────────────────────────────────────────────────

  describe('item query', () => {
    it('returns an item by ID', async () => {
      const { body } = await gqlReq(
        app,
        ITEM,
        { id: itemId },
        authToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.item.id).toBe(itemId);
    });

    it('returns not-found error for a non-existent ID', async () => {
      const { body } = await gqlReq(
        app,
        ITEM,
        { id: FAKE_UUID },
        authToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toMatch(/not found/i);
    });

    it('returns an error for an invalid UUID', async () => {
      const { body } = await gqlReq(
        app,
        ITEM,
        { id: 'not-a-uuid' },
        authToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
    });

    it('denies access without a token', async () => {
      const res = await gqlReq(app, ITEM, { id: itemId });
      expect(isAccessDenied(res, 'item')).toBe(true);
    });
  });

  // ── updateItem mutation ──────────────────────────────────────────────────────

  describe('updateItem mutation', () => {
    it('updates the name and unit of an item', async () => {
      const { body } = await gqlReq(
        app,
        UPDATE_ITEM,
        { updateItemInput: { id: itemId, name: 'updated-e2e-item', unit: 'lt' } },
        authToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.updateItem).toMatchObject({
        id: itemId,
        name: 'updated-e2e-item',
        unit: 'lt',
      });
    });

    it('returns not-found error for a non-existent ID', async () => {
      const { body } = await gqlReq(
        app,
        UPDATE_ITEM,
        { updateItemInput: { id: FAKE_UUID, name: 'ghost' } },
        authToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toMatch(/not found/i);
    });

    it('denies access without a token', async () => {
      const res = await gqlReq(app, UPDATE_ITEM, {
        updateItemInput: { id: itemId, name: 'hacked' },
      });
      expect(isAccessDenied(res, 'updateItem')).toBe(true);
    });
  });

  // ── removeItem mutation ──────────────────────────────────────────────────────

  describe('removeItem mutation', () => {
    it('removes an item and returns the deleted entity', async () => {
      const { body } = await gqlReq(
        app,
        REMOVE_ITEM,
        { id: itemId },
        authToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.removeItem.id).toBe(itemId);
    });

    it('returns not-found error after the item has been deleted', async () => {
      const { body } = await gqlReq(
        app,
        ITEM,
        { id: itemId },
        authToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toMatch(/not found/i);
    });

    it('returns not-found error for a non-existent ID', async () => {
      const { body } = await gqlReq(
        app,
        REMOVE_ITEM,
        { id: FAKE_UUID },
        authToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toMatch(/not found/i);
    });

    it('denies access without a token', async () => {
      const res = await gqlReq(app, REMOVE_ITEM, { id: FAKE_UUID });
      expect(isAccessDenied(res, 'removeItem')).toBe(true);
    });
  });
});
