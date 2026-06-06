import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { TestAppModule } from '../setup/test-app.module';
import { createTestApp } from '../setup/create-test-app';
import {
  gqlReq,
  assertGqlSchemaErrors,
  assertGqlValidationErrors,
} from '../helpers/gql';
import { ensureTestSchema, cleanupUsers } from '../helpers/db';
import { makeUser } from '../helpers/factories';
import { SIGNUP, LOGIN } from '../operations/auth.operations';

describe('login mutation', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userId: string;

  const credentials = makeUser('login');

  beforeAll(async () => {
    await ensureTestSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = createTestApp(moduleFixture);
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    const { body } = await gqlReq(app, SIGNUP, { signupInput: credentials });
    userId = body.data.signup.user.id as string;
  }, 35_000);

  afterAll(async () => {
    await cleanupUsers(dataSource, [userId]);
    await app.close();
  });

  it('200 - returns a JWT token for valid credentials', async () => {
    const { email, password } = credentials;
    const { body } = await gqlReq(app, LOGIN, {
      loginInput: { email, password },
    }).expect(200);

    expect(body.data.login).toBeDefined();
    expect(body.data.login).toMatchObject({
      token: expect.any(String),
      user: {
        id: expect.any(String),
        email: email,
      },
    });
    expect(body.errors).toBeUndefined();
  });

  describe('[graphql schema]', () => {
    it('no input variable', async () => {
      const { body, status } = await gqlReq(app, LOGIN, {});

      expect(status).toBe(400);
      expect(body.errors).toBeDefined();
      expect(body.errors.length).toBe(1);
      body.errors.forEach((e) => {
        expect(e.message).toBe(
          'Variable "$loginInput" of required type "LoginInput!" was not provided.',
        );
        expect(e.extensions.code).toBe('BAD_USER_INPUT');
      });
    });

    it('missing fields', async () => {
      await assertGqlSchemaErrors(
        app,
        LOGIN,
        { loginInput: {} },
        {
          email: 'required type "String!"',
          password: 'required type "String!"',
        },
      );
    });

    it('null on non-nullable', async () => {
      await assertGqlSchemaErrors(
        app,
        LOGIN,
        { loginInput: { email: null, password: null } },
        {
          'loginInput.email': 'Expected non-nullable type',
          'loginInput.password': 'Expected non-nullable type',
        },
      );
    });

    it('wrong field types', async () => {
      await assertGqlSchemaErrors(
        app,
        LOGIN,
        { loginInput: { email: 3, password: [] } },
        {
          'loginInput.email': 'String cannot represent a non string value:',
          'loginInput.password': 'String cannot represent a non string value:',
        },
      );
    });
  });

  describe('[class-validator]', () => {
    it('isNotEmpty', async () => {
      await assertGqlValidationErrors(
        app,
        LOGIN,
        { loginInput: { email: '', password: '' } },
        ['email should not be empty', 'password should not be empty'],
      );
    });

    it('isEmail', async () => {
      await assertGqlValidationErrors(
        app,
        LOGIN,
        {
          loginInput: { email: 'not-an-email', password: credentials.password },
        },
        ['email must be an email'],
      );
    });

    it('maxLength', async () => {
      await assertGqlValidationErrors(
        app,
        LOGIN,
        {
          loginInput: {
            email: `${'a'.repeat(101)}@test.com`,
            password: 'a'.repeat(101),
          },
        },
        [
          'email must be shorter than or equal to 100 characters',
          'password must be shorter than or equal to 100 characters',
        ],
      );
    });
  });

  describe('[Exception]', () => {
    it('401 - unknown email', async () => {
      const { body } = await gqlReq(app, LOGIN, {
        loginInput: { email: 'nobody@nowhere.com', password: 'any' },
      }).expect(200);
      const msgError = `Invalid credentials (email)`;

      expect(body.errors).toBeDefined();
      expect(body.errors.length).toBeGreaterThan(0);
      expect(body.errors[0].message).toEqual(msgError);
      expect(body.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
      expect(body.errors[0].extensions.originalError).toMatchObject({
        message: msgError,
        error: 'Unauthorized',
        statusCode: 401,
      });
    });

    it('401 - wrong password', async () => {
      const { body } = await gqlReq(app, LOGIN, {
        loginInput: { email: credentials.email, password: 'wrong-password' },
      }).expect(200);
      const msgError = `Invalid credentials (password)`;

      expect(body.errors).toBeDefined();
      expect(body.errors.length).toBeGreaterThan(0);
      expect(body.errors[0].message).toEqual(msgError);
      expect(body.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
      expect(body.errors[0].extensions.originalError).toMatchObject({
        message: msgError,
        error: 'Unauthorized',
        statusCode: 401,
      });
    });
  });
});
