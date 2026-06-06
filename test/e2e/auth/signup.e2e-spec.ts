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
import { SIGNUP } from '../operations/auth.operations';

describe('signup mutation', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const createdUserIds: string[] = [];

  const credentials = makeUser('signup');

  beforeAll(async () => {
    await ensureTestSchema();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = createTestApp(moduleFixture);
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  }, 35_000);

  afterAll(async () => {
    await cleanupUsers(dataSource, createdUserIds);
    await app.close();
  });

  it('200 - creates a new user and returns a JWT token', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

  describe('[graphql schema]', () => {
    it('no input variable', async () => {
      const { body, status } = await gqlReq(app, SIGNUP, {});

      expect(status).toBe(400);
      expect(body).toHaveProperty('errors');
      expect(body.errors.length).toBe(1);
      body.errors.forEach((e) => {
        expect(e.message).toBe(
          'Variable "$signupInput" of required type "SignupInput!" was not provided.',
        );
        expect(e.extensions.code).toBe('BAD_USER_INPUT');
      });
    });

    it('missing fields', async () => {
      await assertGqlSchemaErrors(
        app,
        SIGNUP,
        { signupInput: {} },
        {
          email: 'required type "String!"',
          password: 'required type "String!"',
          fullName: 'required type "String!"',
        },
      );
    });

    it('null on non-nullable', async () => {
      await assertGqlSchemaErrors(
        app,
        SIGNUP,
        { signupInput: { email: null, password: null, fullName: null } },
        {
          'signupInput.email': 'Expected non-nullable type',
          'signupInput.password': 'Expected non-nullable type',
          'signupInput.fullName': 'Expected non-nullable type',
        },
      );
    });

    it('wrong field types', async () => {
      await assertGqlSchemaErrors(
        app,
        SIGNUP,
        { signupInput: { email: 3, password: [], fullName: {} } },
        {
          'signupInput.email': 'String cannot represent a non string value:',
          'signupInput.password': 'String cannot represent a non string value:',
          'signupInput.fullName': 'String cannot represent a non string value:',
        },
      );
    });
  });

  describe('[class-validator]', () => {
    it('isNotEmpty', async () => {
      await assertGqlValidationErrors(
        app,
        SIGNUP,
        { signupInput: { email: '', password: '', fullName: '' } },
        [
          'email should not be empty',
          'password should not be empty',
          'fullName should not be empty',
        ],
      );
    });

    it('isEmail', async () => {
      await assertGqlValidationErrors(
        app,
        SIGNUP,
        { signupInput: { ...credentials, email: 'not-an-email' } },
        ['email must be an email'],
      );
    });

    it('maxLength', async () => {
      await assertGqlValidationErrors(
        app,
        SIGNUP,
        {
          signupInput: {
            email: `${'a'.repeat(100)}@test.com`,
            password: 'a'.repeat(101),
            fullName: 'a'.repeat(256),
          },
        },
        [
          'email must be shorter than or equal to 100 characters',
          'password must be shorter than or equal to 100 characters',
          'fullName must be shorter than or equal to 255 characters',
        ],
      );
    });
  });

  describe('[Exception]', () => {
    it('400 - duplicate email', async () => {
      const { body } = await gqlReq(app, SIGNUP, {
        signupInput: credentials,
      }).expect(200);
      const msgError = `(email)=(${credentials.email}) already exists.`;

      expect(body.errors).toBeDefined();
      expect(body.errors.length).toBeGreaterThan(0);
      expect(body.errors[0].message).toEqual(msgError);
      expect(body.errors[0].extensions.code).toEqual('BAD_REQUEST');
      expect(body.errors[0].extensions.originalError).toMatchObject({
        message: msgError,
        error: 'Bad Request',
        statusCode: 400,
      });
    });
  });
});
