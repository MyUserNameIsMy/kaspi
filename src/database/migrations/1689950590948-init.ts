import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1689950590948 implements MigrationInterface {
    name = 'Init1689950590948'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "kaspi_price" double precision, "rating" integer, "review_count" integer, "kaspi_link" character varying, "merchants_count" integer, "merchants_array" jsonb, "price" double precision NOT NULL DEFAULT '0', "fileId" integer, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."files_status_enum" AS ENUM('new', 'analyzed')`);
        await queryRunner.query(`CREATE TABLE "files" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "path" character varying NOT NULL, "filename" character varying NOT NULL, "status" "public"."files_status_enum" NOT NULL DEFAULT 'new', "product_found_count" integer NOT NULL, CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_d6408dea56eea4f9cd8ee7e45e6" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_d6408dea56eea4f9cd8ee7e45e6"`);
        await queryRunner.query(`DROP TABLE "files"`);
        await queryRunner.query(`DROP TYPE "public"."files_status_enum"`);
        await queryRunner.query(`DROP TABLE "products"`);
    }

}
