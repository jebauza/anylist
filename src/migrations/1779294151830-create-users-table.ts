import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1779294151830 implements MigrationInterface {
  name = 'CreateUsersTable1779294151830';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying(100) NOT NULL,
                "password" character varying(100) NOT NULL,
                "full_name" character varying(255) NOT NULL,
                "roles" text array NOT NULL DEFAULT '{user}',
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
