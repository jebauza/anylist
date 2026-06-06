import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { TestAppModule } from '../setup/test-app.module';
import { createTestApp } from '../setup/create-test-app';
import { gqlReq, isAccessDenied } from '../helpers/gql';
import { ensureTestSchema, cleanupUsers } from '../helpers/db';
import { makeUser } from '../helpers/factories';
import { SIGNUP, LOGIN, REVALIDATE_TOKEN } from '../operations/auth.operations';

describe('revaliteToken query', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let userId: string;

  const credentials = makeUser('revalidate');

  beforeAll(async () => {
    await ensureTestSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = createTestApp(moduleFixture);
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { body: signupBody } = await gqlReq(app, SIGNUP, {
      signupInput: credentials,
    });
    userId = signupBody.data.signup.user.id as string;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { body: loginBody } = await gqlReq(app, LOGIN, {
      loginInput: { email: credentials.email, password: credentials.password },
    });
    token = loginBody.data.login.token as string;
  }, 35_000);

  afterAll(async () => {
    await cleanupUsers(dataSource, [userId]);
    await app.close();
  });

  it('returns a fresh JWT token for an authenticated user', async () => {
    const { body } = await gqlReq(app, REVALIDATE_TOKEN, {}, token).expect(
      200,
    );

    expect(body.errors).toBeUndefined();
    expect(body.data.revaliteToken.token).toBeDefined();
    expect(body.data.revaliteToken.user.email).toBe(credentials.email);
  });

  it('denies access without a token', async () => {
    const res = await gqlReq(app, REVALIDATE_TOKEN);
    expect(isAccessDenied(res, 'revaliteToken')).toBe(true);
  });
});
