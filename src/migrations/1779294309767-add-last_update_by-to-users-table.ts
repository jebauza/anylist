import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastUpdateByToUsersTable1779294309767 implements MigrationInterface {
  name = 'AddLastUpdateByToUsersTable1779294309767';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" ADD "last_update_by" uuid
        `);

    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_9bc4b1c75b64559f651f9f3fe90"
            FOREIGN KEY ("last_update_by") REFERENCES "users"("id")
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_9bc4b1c75b64559f651f9f3fe90"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "last_update_by"
        `);
  }
}
