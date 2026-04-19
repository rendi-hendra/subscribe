module.exports = class AddUserRole20260416014400 {
  name = "AddUserRole20260416014400";

  async up(queryRunner) {
    await queryRunner.query(
      "ALTER TABLE `users` ADD COLUMN `role` varchar(255) NOT NULL DEFAULT 'user'"
    );
  }

  async down(queryRunner) {
    await queryRunner.query("ALTER TABLE `users` DROP COLUMN `role` ");
  }
};
