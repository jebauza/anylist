import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateItemsTable1779633170260 implements MigrationInterface {
  name = 'UpdateItemsTable1779633170260';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "items" 
        DROP CONSTRAINT "UQ_213736582899b3599acaade2cd1"
    `);
    await queryRunner.query(`
        ALTER TABLE "items" 
        DROP COLUMN "quantity_units"
    `);
    await queryRunner.query(`
        ALTER TABLE "items" 
        DROP COLUMN "quantity"
    `);
    await queryRunner.query(`
        ALTER TABLE "items" 
        ADD "unit" character varying(20) NOT NULL DEFAULT ''
    `);
    await queryRunner.query(`
        ALTER TABLE "items" 
        ADD "user_id" uuid
    `);
    await queryRunner.query(`
        ALTER TABLE "items" 
        ADD CONSTRAINT "UQ_84ef03d7eed8376b5838a4775d1" UNIQUE ("name", "unit")
    `);
    await queryRunner.query(`
        ALTER TABLE "items" 
        ADD CONSTRAINT "FK_3b934e62fb52bac909e0ddf5422" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") 
        ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "items" 
        DROP CONSTRAINT "FK_3b934e62fb52bac909e0ddf5422"
    `);
    await queryRunner.query(`
        ALTER TABLE "items" 
        DROP CONSTRAINT "UQ_84ef03d7eed8376b5838a4775d1"
    `);
    await queryRunner.query(`
        ALTER TABLE "items" 
        DROP COLUMN "user_id"
    `);
    await queryRunner.query(`
        ALTER TABLE "items" 
        DROP COLUMN "unit"
    `);
    await queryRunner.query(`
        ALTER TABLE "items" 
        ADD "quantity" double precision NOT NULL DEFAULT '0'
    `);
    await queryRunner.query(`
        ALTER TABLE "items" 
        ADD "quantity_units" character varying(20)
    `);
    await queryRunner.query(`
        ALTER TABLE "items" 
        ADD CONSTRAINT "UQ_213736582899b3599acaade2cd1" UNIQUE ("name")
    `);
  }
}
