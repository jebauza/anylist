import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { TestAppModule } from './setup/test-app.module';
import { createTestApp } from './setup/create-test-app';
import { gqlReq, isAccessDenied, FAKE_UUID } from './helpers/gql';
import { ensureTestSchema, cleanupUsers } from './helpers/db';
import { makeUser, makeList } from './helpers/factories';
import { SIGNUP } from './operations/auth.operations';
import {
  CREATE_LIST,
  LISTS,
  LIST,
  UPDATE_LIST,
  REMOVE_LIST,
} from './operations/lists.operations';

describe('ListsResolver (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let authToken: string;
  let userId: string;
  let listId: string;

  const user = makeUser('lists');

  beforeAll(async () => {
    await ensureTestSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = createTestApp(moduleFixture);
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

  // ── createList mutation ──────────────────────────────────────────────────────

  describe('createList mutation', () => {
    it('creates a list successfully', async () => {
      const listData = makeList();

      const { body } = await gqlReq(
        app,
        CREATE_LIST,
        { createListInput: listData },
        authToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.createList).toMatchObject({ name: listData.name });
      expect(body.data.createList.id).toBeDefined();

      listId = body.data.createList.id as string;
    });

    it('denies access without a token', async () => {
      const res = await gqlReq(app, CREATE_LIST, {
        createListInput: makeList(),
      });
      expect(isAccessDenied(res, 'createList')).toBe(true);
    });
  });

  // ── lists query ──────────────────────────────────────────────────────────────

  describe('lists query', () => {
    it('returns the current user lists', async () => {
      const { body } = await gqlReq(
        app,
        LISTS,
        { limit: 50, offset: 0 },
        authToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(Array.isArray(body.data.lists)).toBe(true);
      expect(body.data.lists.length).toBeGreaterThanOrEqual(1);
    });

    it('returns lists matching a search term', async () => {
      const { body } = await gqlReq(
        app,
        LISTS,
        { search: 'E2E' },
        authToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(Array.isArray(body.data.lists)).toBe(true);
    });

    it('denies access without a token', async () => {
      const res = await gqlReq(app, LISTS, { limit: 10 });
      expect(isAccessDenied(res, 'lists')).toBe(true);
    });
  });

  // ── list query ───────────────────────────────────────────────────────────────

  describe('list query', () => {
    it('returns a list by ID', async () => {
      const { body } = await gqlReq(
        app,
        LIST,
        { id: listId },
        authToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.list.id).toBe(listId);
    });

    it('returns not-found error for a non-existent ID', async () => {
      const { body } = await gqlReq(
        app,
        LIST,
        { id: FAKE_UUID },
        authToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toMatch(/not found/i);
    });

    it('returns an error for an invalid UUID', async () => {
      const { body } = await gqlReq(
        app,
        LIST,
        { id: 'not-a-uuid' },
        authToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
    });

    it('denies access without a token', async () => {
      const res = await gqlReq(app, LIST, { id: listId });
      expect(isAccessDenied(res, 'list')).toBe(true);
    });
  });

  // ── updateList mutation ──────────────────────────────────────────────────────

  describe('updateList mutation', () => {
    it('updates the list name', async () => {
      const newName = 'Updated E2E List Name';
      const { body } = await gqlReq(
        app,
        UPDATE_LIST,
        { updateListInput: { id: listId, name: newName } },
        authToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.updateList).toMatchObject({ id: listId, name: newName });
    });

    it('returns not-found error for a non-existent ID', async () => {
      const { body } = await gqlReq(
        app,
        UPDATE_LIST,
        { updateListInput: { id: FAKE_UUID, name: 'Ghost List' } },
        authToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toMatch(/not found/i);
    });

    it('denies access without a token', async () => {
      const res = await gqlReq(app, UPDATE_LIST, {
        updateListInput: { id: listId, name: 'Hacked' },
      });
      expect(isAccessDenied(res, 'updateList')).toBe(true);
    });
  });

  // ── removeList mutation ──────────────────────────────────────────────────────

  describe('removeList mutation', () => {
    it('removes a list and returns the deleted entity', async () => {
      const { body } = await gqlReq(
        app,
        REMOVE_LIST,
        { id: listId },
        authToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.removeList.id).toBe(listId);
    });

    it('returns not-found error after the list has been deleted', async () => {
      const { body } = await gqlReq(
        app,
        LIST,
        { id: listId },
        authToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toMatch(/not found/i);
    });

    it('returns not-found error for a non-existent ID', async () => {
      const { body } = await gqlReq(
        app,
        REMOVE_LIST,
        { id: FAKE_UUID },
        authToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toMatch(/not found/i);
    });

    it('denies access without a token', async () => {
      const res = await gqlReq(app, REMOVE_LIST, { id: FAKE_UUID });
      expect(isAccessDenied(res, 'removeList')).toBe(true);
    });
  });
});
