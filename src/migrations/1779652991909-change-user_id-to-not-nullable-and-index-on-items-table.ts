import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeUserIdToNotNullableAndIndexOnItemsTable1779652991909 implements MigrationInterface {
  name = 'ChangeUserIdToNotNullableAndIndexOnItemsTable1779652991909';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "items" DROP CONSTRAINT "FK_3b934e62fb52bac909e0ddf5422"
        `);

    await queryRunner.query(`
            ALTER TABLE "items" ALTER COLUMN "user_id" SET NOT NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "items" ALTER COLUMN "user_id" SET NOT NULL
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_3b934e62fb52bac909e0ddf542" ON "items" ("user_id")
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
            ALTER TABLE "items" DROP CONSTRAINT "FK_3b934e62fb52bac909e0ddf5422"
        `);

    await queryRunner.query(`
            DROP INDEX "public"."IDX_3b934e62fb52bac909e0ddf542"
        `);

    await queryRunner.query(`
            ALTER TABLE "items" ALTER COLUMN "user_id" DROP NOT NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "items" ALTER COLUMN "user_id" DROP NOT NULL
        `);

    await queryRunner.query(`
            ALTER TABLE "items" 
            ADD CONSTRAINT "FK_3b934e62fb52bac909e0ddf5422" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
