import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomerNameOrder1794474569697 implements MigrationInterface {
    name = 'AddCustomerNameOrder1794474569697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "customer_name" character varying(100) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "customer_name"`);
    }

}
