import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { TestAppModule } from './setup/test-app.module';
import { gqlReq, isAccessDenied } from './helpers/gql';
import { ensureTestSchema, cleanupUsers } from './helpers/db';
import { makeUser } from './helpers/factories';
import { SIGNUP, LOGIN, ME, REVALIDATE_TOKEN } from './operations/auth.operations';

describe('AuthResolver (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const createdUserIds: string[] = [];

  const credentials = makeUser('auth');

  beforeAll(async () => {
    await ensureTestSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  }, 35_000);

  afterAll(async () => {
    await cleanupUsers(dataSource, createdUserIds);
    await app.close();
  });

  // ── signup ───────────────────────────────────────────────────────────────────

  describe('signup mutation', () => {
    it('creates a new user and returns a JWT token', async () => {
      const { body } = await gqlReq(app, SIGNUP, {
        signupInput: credentials,
      }).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.signup.token).toBeDefined();
      expect(body.data.signup.user).toMatchObject({
        email: credentials.email,
        fullName: credentials.fullName,
        isActive: true,
      });
      expect(body.data.signup.user.roles).toContain('user');

      createdUserIds.push(body.data.signup.user.id as string);
    });

    it('returns an error when email is already registered', async () => {
      const { body } = await gqlReq(app, SIGNUP, {
        signupInput: credentials,
      }).expect(200);

      expect(body.errors).toBeDefined();
      expect(body.data?.signup).toBeUndefined();
    });
  });

  // ── login ────────────────────────────────────────────────────────────────────

  describe('login mutation', () => {
    it('returns a JWT token for valid credentials', async () => {
      const { body } = await gqlReq(app, LOGIN, {
        loginInput: { email: credentials.email, password: credentials.password },
      }).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.login.token).toBeDefined();
      expect(body.data.login.user.email).toBe(credentials.email);
    });

    it('returns an error for wrong password', async () => {
      const { body } = await gqlReq(app, LOGIN, {
        loginInput: { email: credentials.email, password: 'wrong-password' },
      }).expect(200);

      expect(body.errors).toBeDefined();
      expect(body.data?.login).toBeUndefined();
    });

    it('returns an error for non-existent email', async () => {
      const { body } = await gqlReq(app, LOGIN, {
        loginInput: { email: 'nobody@nowhere.com', password: 'any' },
      }).expect(200);

      expect(body.errors).toBeDefined();
    });
  });

  // ── me ───────────────────────────────────────────────────────────────────────

  describe('me query', () => {
    let token: string;

    beforeAll(async () => {
      const { body } = await gqlReq(app, LOGIN, {
        loginInput: { email: credentials.email, password: credentials.password },
      });
      token = body.data.login.token as string;
    });

    it('returns the current authenticated user', async () => {
      const { body } = await gqlReq(app, ME, {}, token).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.me.email).toBe(credentials.email);
    });

    it('denies access without a token', async () => {
      const res = await gqlReq(app, ME);
      expect(isAccessDenied(res, 'me')).toBe(true);
    });
  });

  // ── revalidateToken ──────────────────────────────────────────────────────────

  describe('revaliteToken query', () => {
    let token: string;

    beforeAll(async () => {
      const { body } = await gqlReq(app, LOGIN, {
        loginInput: { email: credentials.email, password: credentials.password },
      });
      token = body.data.login.token as string;
    });

    it('returns a fresh JWT token for an authenticated user', async () => {
      const { body } = await gqlReq(app, REVALIDATE_TOKEN, {}, token).expect(200);

      expect(body.errors).toBeUndefined();
      expect(body.data.revaliteToken.token).toBeDefined();
      expect(body.data.revaliteToken.user.email).toBe(credentials.email);
    });

    it('denies access without a token', async () => {
      const res = await gqlReq(app, REVALIDATE_TOKEN);
      expect(isAccessDenied(res, 'revaliteToken')).toBe(true);
    });
  });
});
