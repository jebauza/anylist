import { INestApplication } from '@nestjs/common';
import request from 'supertest';

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

export function isAccessDenied(
  res: {
    status: number;
    body: {
      errors?: Array<{ message: string }>;
      data?: Record<string, unknown> | null;
    };
  },
  dataField?: string,
): boolean {
  if (res.status === 401) return true;
  if (res.status === 200 && (res.body.errors?.length ?? 0) > 0) {
    if (!dataField) return true;
    return (res.body.data?.[dataField] ?? null) == null;
  }
  return false;
}
