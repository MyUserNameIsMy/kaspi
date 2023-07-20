import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1689739640860 implements MigrationInterface {
    name = ' $npmConfigName1689739640860'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_names" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "fileId" integer, CONSTRAINT "PK_33c2b3a8b6b66ad65a3157c4a9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_names" ADD CONSTRAINT "FK_fa1290ecdae0c528609c27bcc86" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_names" DROP CONSTRAINT "FK_fa1290ecdae0c528609c27bcc86"`);
        await queryRunner.query(`DROP TABLE "product_names"`);
    }

}
