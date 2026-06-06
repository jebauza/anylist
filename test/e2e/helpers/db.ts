import { DataSource } from 'typeorm';
import { TEST_SCHEMA } from '../setup/test-app.module';

export async function ensureTestSchema(): Promise<void> {
  const rawDs = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: +(process.env.DB_PORT ?? '5432'),
    database: process.env.DB_NAME ?? 'anylist_db',
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD as string,
  });
  await rawDs.initialize();
  await rawDs.query(`CREATE SCHEMA IF NOT EXISTS ${TEST_SCHEMA}`);
  await rawDs.destroy();
}

export async function promoteToAdmin(
  dataSource: DataSource,
  userId: string,
): Promise<void> {
  await dataSource.query(
    `UPDATE ${TEST_SCHEMA}.users SET roles = '{admin,user}' WHERE id = $1`,
    [userId],
  );
}

export async function cleanupUsers(
  dataSource: DataSource,
  userIds: string[],
): Promise<void> {
  // Null out last_update_by references to avoid FK violation on self-referencing column
  for (const id of userIds) {
    await dataSource.query(
      `UPDATE ${TEST_SCHEMA}.users SET last_update_by = NULL WHERE last_update_by = $1`,
      [id],
    );
  }
  for (const id of userIds) {
    await dataSource.query(
      `DELETE FROM ${TEST_SCHEMA}.lists WHERE user_id = $1`,
      [id],
    );
    await dataSource.query(
      `DELETE FROM ${TEST_SCHEMA}.items WHERE user_id = $1`,
      [id],
    );
    await dataSource.query(`DELETE FROM ${TEST_SCHEMA}.users WHERE id = $1`, [
      id,
    ]);
  }
}
