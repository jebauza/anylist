import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export type GqlError = {
  message: string;
  extensions: {
    code: string;
    originalError: {
      message: string | string[];
      error: string;
      statusCode: number;
    };
  };
};

export const FAKE_UUID = '00000000-0000-4000-8000-000000000000';

export function gqlReq(
  app: INestApplication,
  query: string,
  variables: Record<string, unknown> = {},
  token?: string,
) {
  const req = request(app.getHttpServer())
    .post('/graphql')
    .send({ query, variables });

  if (token) req.set('Authorization', `Bearer ${token}`);
  return req;
}

export async function assertGqlSchemaErrors(
  app: INestApplication,
  operation: string,
  variables: Record<string, unknown>,
  validateFields: Record<string, string>,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { body, status } = await gqlReq(app, operation, variables);
  const errors = body.errors as GqlError[];

  expect(status).toBe(400);
  expect(errors).toHaveLength(Object.keys(validateFields).length);
  errors.forEach((e) => expect(e.extensions.code).toBe('BAD_USER_INPUT'));

  for (const [fieldPath, validation] of Object.entries(validateFields)) {
    const match = errors.find(
      (e) => e.message.includes(fieldPath) && e.message.includes(validation),
    );
    expect(match).toBeDefined();
  }
}

export async function assertGqlValidationErrors(
  app: INestApplication,
  operation: string,
  variables: Record<string, unknown>,
  validateMessages: string[],
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { body } = await gqlReq(app, operation, variables);
  const errors = body.errors as GqlError[];

  expect(errors).toBeDefined();
  expect(errors.length).toBeGreaterThan(0);
  expect(errors[0].message).toEqual('Bad Request Exception');
  expect(errors[0].extensions.code).toEqual('BAD_REQUEST');
  expect(errors[0].extensions.originalError).toMatchObject({
    error: 'Bad Request',
    statusCode: 400,
  });
  expect(errors[0].extensions.originalError.message).toEqual(
    expect.arrayContaining(validateMessages),
  );
}

export async function assertGqlUnauthenticated(
  app: INestApplication,
  operation: string,
  variables: Record<string, unknown> = {},
  validToken?: string,
): Promise<void> {
  const tokens: Array<string | undefined> = [undefined, 'token-not-valid'];

  if (validToken) {
    const tamperedToken =
      validToken.slice(0, -1) + (validToken.endsWith('a') ? 'b' : 'a');
    tokens.push(tamperedToken);
  }

  for (const token of tokens) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { body } = await gqlReq(app, operation, variables, token).expect(200);
    const errors = body.errors as GqlError[];

    expect(body.data).toBeNull();
    expect(errors).toBeDefined();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toBe('Unauthorized');
    expect(errors[0].extensions.code).toBe('UNAUTHENTICATED');
    expect(errors[0].extensions.originalError).toMatchObject({
      message: 'Unauthorized',
      statusCode: 401,
    });
  }
}

export async function assertGqlForbidden(
  app: INestApplication,
  operation: string,
  variables: Record<string, unknown> = {},
  token?: string,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { body } = await gqlReq(app, operation, variables, token);
  const errors = body.errors as GqlError[];

  expect(errors).toBeDefined();
  expect(errors.length).toBeGreaterThan(0);
  expect(errors[0].extensions.code).toBe('FORBIDDEN');
  expect(errors[0].extensions.originalError).toMatchObject({
    statusCode: 403,
    error: 'Forbidden',
  });
}
