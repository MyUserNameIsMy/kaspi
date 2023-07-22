import { MigrationInterface, QueryRunner } from "typeorm";

export class CascadeDeleteFile1689950881053 implements MigrationInterface {
    name = 'CascadeDeleteFile1689950881053'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_d6408dea56eea4f9cd8ee7e45e6"`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_d6408dea56eea4f9cd8ee7e45e6" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_d6408dea56eea4f9cd8ee7e45e6"`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_d6408dea56eea4f9cd8ee7e45e6" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
