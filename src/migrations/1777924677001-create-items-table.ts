import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateItemsTable1777924677001 implements MigrationInterface {
  name = 'CreateItemsTable1777924677001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "items" (
        "id"            uuid                    NOT NULL DEFAULT uuid_generate_v4(),
        "name"          character varying(255)  NOT NULL,
        "quantity"      double precision        NOT NULL DEFAULT '0',
        "quantityUnits" character varying(20),
        CONSTRAINT "UQ_213736582899b3599acaade2cd1" UNIQUE ("name"),
        CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "items"`);
  }
}
