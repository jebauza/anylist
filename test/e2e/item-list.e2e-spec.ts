import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { TestAppModule } from './setup/test-app.module';
import { createTestApp } from './setup/create-test-app';
import { gqlReq, assertGqlUnauthenticated, FAKE_UUID } from './helpers/gql';
import { ensureTestSchema, cleanupUsers } from './helpers/db';
import { makeUser, makeItem, makeList } from './helpers/factories';
import { SIGNUP } from './operations/auth.operations';
import { CREATE_ITEM } from './operations/items.operations';
import { CREATE_LIST } from './operations/lists.operations';
import {
  CREATE_ITEM_LIST,
  ITEM_LIST,
  UPDATE_ITEM_LIST,
} from './operations/item-list.operations';

describe('ItemListResolver (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let authToken: string;
  let userId: string;
  let listId: string;
  let itemId: string;
  let itemListId: string;

  const user = makeUser('item-list');

  beforeAll(async () => {
    await ensureTestSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = createTestApp(moduleFixture);
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Seed user → list → item
    const signupRes = await gqlReq(app, SIGNUP, { signupInput: user });
    authToken = signupRes.body.data.signup.token as string;
    userId = signupRes.body.data.signup.user.id as string;

    const listRes = await gqlReq(
      app,
      CREATE_LIST,
      { createListInput: makeList() },
      authToken,
    );
    listId = listRes.body.data.createList.id as string;

    const itemRes = await gqlReq(
      app,
      CREATE_ITEM,
      { createItemInput: makeItem() },
      authToken,
    );
    itemId = itemRes.body.data.createItem.id as string;
  }, 35_000);

  afterAll(async () => {
    await cleanupUsers(dataSource, [userId]);
    await app.close();
  });

  // ── createItemList mutation ──────────────────────────────────────────────────

  describe('createItemList mutation', () => {
    it('creates an item list entry with the correct defaults', async () => {
      const { body } = await gqlReq(
        app,
        CREATE_ITEM_LIST,
        { createItemListInput: { listId, itemId, quantity: 3 } },
        authToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.createItemList).toMatchObject({
        quantity: 3,
        completed: false,
      });
      expect(body.data.createItemList.id).toBeDefined();

      itemListId = body.data.createItemList.id as string;
    });

    it('returns error when adding a duplicate item to the same list', async () => {
      const { body } = await gqlReq(
        app,
        CREATE_ITEM_LIST,
        { createItemListInput: { listId, itemId, quantity: 1 } },
        authToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
    });

    it('returns not-found error when list does not exist', async () => {
      const { body } = await gqlReq(
        app,
        CREATE_ITEM_LIST,
        { createItemListInput: { listId: FAKE_UUID, itemId, quantity: 1 } },
        authToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toMatch(/not found/i);
    });

    it('returns not-found error when item does not exist', async () => {
      const { body } = await gqlReq(
        app,
        CREATE_ITEM_LIST,
        { createItemListInput: { listId, itemId: FAKE_UUID, quantity: 1 } },
        authToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toMatch(/not found/i);
    });

    it('denies access without a token', async () => {
      await assertGqlUnauthenticated(app, CREATE_ITEM_LIST, {
        createItemListInput: { listId, itemId, quantity: 1 },
      });
    });
  });

  // ── itemList query ───────────────────────────────────────────────────────────

  describe('itemList query', () => {
    it('returns an item list entry by ID', async () => {
      const { body } = await gqlReq(
        app,
        ITEM_LIST,
        { id: itemListId },
        authToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.itemList).toMatchObject({
        id: itemListId,
        quantity: 3,
        completed: false,
      });
    });

    it('returns not-found error for a non-existent ID', async () => {
      const { body } = await gqlReq(
        app,
        ITEM_LIST,
        { id: FAKE_UUID },
        authToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toMatch(/not found/i);
    });

    it('returns an error for an invalid UUID', async () => {
      const { body } = await gqlReq(
        app,
        ITEM_LIST,
        { id: 'not-a-valid-uuid' },
        authToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
    });

    it('denies access without a token', async () => {
      await assertGqlUnauthenticated(app, ITEM_LIST, { id: itemListId });
    });
  });

  // ── updateItemList mutation ──────────────────────────────────────────────────

  describe('updateItemList mutation', () => {
    it('updates the quantity', async () => {
      const { body } = await gqlReq(
        app,
        UPDATE_ITEM_LIST,
        { updateItemListInput: { id: itemListId, quantity: 10 } },
        authToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.updateItemList).toMatchObject({
        id: itemListId,
        quantity: 10,
      });
    });

    it('marks the entry as completed', async () => {
      const { body } = await gqlReq(
        app,
        UPDATE_ITEM_LIST,
        { updateItemListInput: { id: itemListId, completed: true } },
        authToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.updateItemList.completed).toBe(true);
    });

    // it('resets completed to false when null is sent', async () => {
    //   const { body } = await gqlReq(
    //     app,
    //     UPDATE_ITEM_LIST,
    //     { updateItemListInput: { id: itemListId, completed: null } },
    //     authToken,
    //   ).expect(200);

    //   expect(body.errors).toBeUndefined();
    //   expect(body.data.updateItemList.completed).toBe(false);
    // });

    it('does not overwrite quantity when only completed is updated', async () => {
      const { body } = await gqlReq(
        app,
        UPDATE_ITEM_LIST,
        { updateItemListInput: { id: itemListId, completed: true } },
        authToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      // quantity must still be 10 from the earlier update
      expect(body.data.updateItemList.quantity).toBe(10);
    });

    it('returns not-found error for a non-existent ID', async () => {
      const { body } = await gqlReq(
        app,
        UPDATE_ITEM_LIST,
        { updateItemListInput: { id: FAKE_UUID, quantity: 5 } },
        authToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toMatch(/not found/i);
    });

    it('denies access without a token', async () => {
      await assertGqlUnauthenticated(app, UPDATE_ITEM_LIST, {
        updateItemListInput: { id: itemListId, quantity: 5 },
      });
    });
  });
});
