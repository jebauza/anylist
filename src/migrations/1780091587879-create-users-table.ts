import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1780091587879 implements MigrationInterface {
  name = 'CreateUsersTable1780091587879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying(100) NOT NULL,
                "password" character varying(100) NOT NULL,
                "full_name" character varying(255) NOT NULL,
                "roles" text array NOT NULL DEFAULT '{user}',
                "is_active" boolean NOT NULL DEFAULT true,
                "last_update_by" uuid,
                CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_users_email" ON "users" ("email")
        `);
    await queryRunner.query(`
            ALTER TABLE "users" 
            ADD CONSTRAINT "FK_users_last_update_by" 
            FOREIGN KEY ("last_update_by") REFERENCES "users"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_users_last_update_by"
        `);

    await queryRunner.query(`
            DROP INDEX "public"."UQ_users_email"
        `);

    await queryRunner.query(`
            DROP TABLE "users"
        `);
  }
}
