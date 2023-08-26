import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTypeRating1693065240960 implements MigrationInterface {
    name = 'FixTypeRating1693065240960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "rating" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "rating" integer`);
    }

}
