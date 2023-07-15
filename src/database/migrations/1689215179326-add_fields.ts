import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFields1689215179326 implements MigrationInterface {
    name = 'AddFields1689215179326'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files" ADD "filename" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "filename"`);
    }

}
