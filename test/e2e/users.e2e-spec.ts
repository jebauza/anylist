import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { TestAppModule } from './setup/test-app.module';
import { createTestApp } from './setup/create-test-app';
import { gqlReq, assertGqlUnauthenticated, assertGqlForbidden, FAKE_UUID } from './helpers/gql';
import { ensureTestSchema, cleanupUsers, promoteToAdmin } from './helpers/db';
import { makeUser } from './helpers/factories';
import { SIGNUP, LOGIN } from './operations/auth.operations';
import { USERS, USER, BLOCK_USER, UPDATE_USER } from './operations/users.operations';

describe('UsersResolver (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let adminToken: string;
  let adminId: string;
  let regularToken: string;
  let regularId: string;
  let targetId: string;

  const adminCredentials = makeUser('admin');
  const regularCredentials = makeUser('regular');
  const targetCredentials = makeUser('target');

  beforeAll(async () => {
    await ensureTestSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = createTestApp(moduleFixture);
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Seed admin user
    const adminSignup = await gqlReq(app, SIGNUP, { signupInput: adminCredentials });
    adminId = adminSignup.body.data.signup.user.id as string;
    await promoteToAdmin(dataSource, adminId);
    const adminLogin = await gqlReq(app, LOGIN, {
      loginInput: { email: adminCredentials.email, password: adminCredentials.password },
    });
    adminToken = adminLogin.body.data.login.token as string;

    // Seed regular user
    const regularSignup = await gqlReq(app, SIGNUP, { signupInput: regularCredentials });
    regularId = regularSignup.body.data.signup.user.id as string;
    const regularLogin = await gqlReq(app, LOGIN, {
      loginInput: { email: regularCredentials.email, password: regularCredentials.password },
    });
    regularToken = regularLogin.body.data.login.token as string;

    // Seed target user (subject of block/update operations)
    const targetSignup = await gqlReq(app, SIGNUP, { signupInput: targetCredentials });
    targetId = targetSignup.body.data.signup.user.id as string;
  }, 35_000);

  afterAll(async () => {
    await cleanupUsers(dataSource, [adminId, regularId, targetId]);
    await app.close();
  });

  // ── users query ──────────────────────────────────────────────────────────────

  describe('users query', () => {
    it('returns a list of users when requested by an admin', async () => {
      const { body } = await gqlReq(app, USERS, { limit: 10 }, adminToken).expect(200);

      expect(body.errors).toBeUndefined();
      expect(Array.isArray(body.data.users)).toBe(true);
      expect(body.data.users.length).toBeGreaterThanOrEqual(1);
    });

    it('returns forbidden error when requested by a regular user', async () => {
      await assertGqlForbidden(app, USERS, { limit: 10 }, regularToken);
    });

    it('denies access without a token', async () => {
      await assertGqlUnauthenticated(app, USERS, { limit: 10 });
    });
  });

  // ── user query ───────────────────────────────────────────────────────────────

  describe('user query', () => {
    it('returns a user by ID when requested by an admin', async () => {
      const { body } = await gqlReq(
        app,
        USER,
        { id: regularId },
        adminToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.user).toMatchObject({ id: regularId, email: regularCredentials.email });
    });

    it('returns not-found error for a non-existent ID', async () => {
      const { body } = await gqlReq(
        app,
        USER,
        { id: FAKE_UUID },
        adminToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toMatch(/not found/i);
    });

    it('returns forbidden error when requested by a regular user', async () => {
      await assertGqlForbidden(app, USER, { id: regularId }, regularToken);
    });
  });

  // ── blockUser mutation ───────────────────────────────────────────────────────

  describe('blockUser mutation', () => {
    it('sets isActive to false for the target user', async () => {
      const { body } = await gqlReq(
        app,
        BLOCK_USER,
        { id: targetId },
        adminToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.blockUser).toMatchObject({ id: targetId, isActive: false });
    });

    it('returns forbidden error when called by a regular user', async () => {
      await assertGqlForbidden(app, BLOCK_USER, { id: targetId }, regularToken);
    });

    it('denies access without a token', async () => {
      await assertGqlUnauthenticated(app, BLOCK_USER, { id: targetId });
    });
  });

  // ── updateUser mutation ──────────────────────────────────────────────────────

  describe('updateUser mutation', () => {
    it('updates the fullName of a user', async () => {
      const newFullName = 'Updated Name E2E';
      const { body } = await gqlReq(
        app,
        UPDATE_USER,
        { updateUserInput: { id: regularId, fullName: newFullName } },
        adminToken,
      ).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.updateUser).toMatchObject({ id: regularId, fullName: newFullName });
    });

    it('returns not-found error for a non-existent user ID', async () => {
      const { body } = await gqlReq(
        app,
        UPDATE_USER,
        { updateUserInput: { id: FAKE_UUID, fullName: 'Ghost' } },
        adminToken,
      ).expect(200);

      expect(body.errors).toBeDefined();
      expect(body.errors[0].message).toMatch(/not found/i);
    });

    it('returns forbidden error when called by a regular user', async () => {
      await assertGqlForbidden(
        app,
        UPDATE_USER,
        { updateUserInput: { id: regularId, fullName: 'Hacker' } },
        regularToken,
      );
    });
  });
});
