import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsProduct1690952416000 implements MigrationInterface {
    name = 'AddFieldsProduct1690952416000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "search_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ADD "kaspi_name" character varying`);
        await queryRunner.query(`ALTER TABLE "products" ADD "kaspi_id" integer`);
        await queryRunner.query(`ALTER TABLE "products" ADD "created_time" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "created_time"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "kaspi_id"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "kaspi_name"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "search_name"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "name" character varying NOT NULL`);
    }

}
