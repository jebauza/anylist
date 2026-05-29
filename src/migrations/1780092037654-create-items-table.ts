import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateItemsTable1780092037654 implements MigrationInterface {
  name = 'CreateItemsTable1780092037654';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "unit" character varying(20) NOT NULL DEFAULT '',
                "user_id" uuid NOT NULL,
                CONSTRAINT "UQ_items_name_unit" UNIQUE ("name", "unit"),
                CONSTRAINT "PK_items_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_items_user_id" ON "items" ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "items"
            ADD CONSTRAINT "FK_items_user_id"
            FOREIGN KEY ("user_id")
            REFERENCES "users"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "items"
            DROP CONSTRAINT "FK_items_user_id"
        `);

    await queryRunner.query(`
            DROP INDEX "public"."IDX_items_user_id"
        `);

    await queryRunner.query(`
            DROP TABLE "items"
        `);
  }
}
