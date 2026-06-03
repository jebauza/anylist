import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateItemsListsTable1780359217884 implements MigrationInterface {
  name = 'CreateItemsListsTable1780359217884';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "items_lists" (
        "id"        uuid    NOT NULL DEFAULT uuid_generate_v4(),
        "quantity"  integer NOT NULL DEFAULT '1',
        "completed" boolean NOT NULL DEFAULT false,
        "item_id"   uuid    NOT NULL,
        "list_id"   uuid    NOT NULL,
        CONSTRAINT "UQ_items_lists_item_id_list_id" UNIQUE ("item_id", "list_id"),
        CONSTRAINT "PK_items_lists_id"              PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_items_lists_list_id"
        ON "items_lists" ("list_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "items_lists"
        ADD CONSTRAINT "FK_items_lists_item_id"
        FOREIGN KEY ("item_id") REFERENCES "items"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "items_lists"
        ADD CONSTRAINT "FK_items_lists_list_id"
        FOREIGN KEY ("list_id") REFERENCES "lists"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "items_lists" DROP CONSTRAINT "FK_items_lists_list_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "items_lists" DROP CONSTRAINT "FK_items_lists_item_id"
    `);

    await queryRunner.query(`
      DROP INDEX "public"."IDX_items_lists_list_id"
    `);

    await queryRunner.query(`
      DROP TABLE "items_lists"
    `);
  }
}
