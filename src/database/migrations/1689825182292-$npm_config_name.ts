import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1689825182292 implements MigrationInterface {
    name = ' $npmConfigName1689825182292'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_names" ADD "kaspi_price" double precision`);
        await queryRunner.query(`ALTER TABLE "product_names" ADD "rating" integer`);
        await queryRunner.query(`ALTER TABLE "product_names" ADD "review_count" integer`);
        await queryRunner.query(`ALTER TABLE "product_names" ADD "kaspi_link" character varying`);
        await queryRunner.query(`ALTER TABLE "product_names" ADD "suppliers_count" integer`);
        await queryRunner.query(`ALTER TABLE "product_names" ADD "suppliers_array" text array`);
        await queryRunner.query(`ALTER TABLE "product_names" ADD "price" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE TYPE "public"."files_status_enum" AS ENUM('new', 'analyzed')`);
        await queryRunner.query(`ALTER TABLE "files" ADD "status" "public"."files_status_enum" NOT NULL DEFAULT 'new'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."files_status_enum"`);
        await queryRunner.query(`ALTER TABLE "product_names" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "product_names" DROP COLUMN "suppliers_array"`);
        await queryRunner.query(`ALTER TABLE "product_names" DROP COLUMN "suppliers_count"`);
        await queryRunner.query(`ALTER TABLE "product_names" DROP COLUMN "kaspi_link"`);
        await queryRunner.query(`ALTER TABLE "product_names" DROP COLUMN "review_count"`);
        await queryRunner.query(`ALTER TABLE "product_names" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "product_names" DROP COLUMN "kaspi_price"`);
    }

}
