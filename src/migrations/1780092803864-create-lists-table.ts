import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateListsTable1780092803864 implements MigrationInterface {
  name = 'CreateListsTable1780092803864';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "lists" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "name" character varying(255) NOT NULL, 
                "user_id" uuid NOT NULL, 
                CONSTRAINT "PK_lists_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_lists_user_id" ON "lists" ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "lists" 
            ADD CONSTRAINT "FK_lists_user_id" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "lists" 
            DROP CONSTRAINT "FK_lists_user_id"
        `);

    await queryRunner.query(`
            DROP INDEX "public"."IDX_lists_user_id"
        `);

    await queryRunner.query(`
            DROP TABLE "lists"
        `);
  }
}
