module.exports = class CreatePlanTable20260416000000 {
  name = "CreatePlanTable20260416000000";

  async up(queryRunner) {
    await queryRunner.query(
      "CREATE TABLE `plans` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `price` decimal(15,2) NOT NULL, `durationDays` int NOT NULL, `description` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );

    await queryRunner.query(
      "INSERT INTO `plans` (`name`, `price`, `durationDays`, `description`) VALUES ('Basic Plan', 50000.00, 30, 'Paket Basic 30 Hari'), ('Premium Plan', 150000.00, 90, 'Paket Premium 90 Hari')"
    );

    // Get an existing planId (specifically from the basic plan just inserted)
    const result = await queryRunner.query(
      "SELECT id FROM `plans` ORDER BY id ASC LIMIT 1"
    );
    const planId = result[0]?.id || 1;

    // Add planId to subscriptions
    await queryRunner.query(
      `ALTER TABLE \`subscriptions\` Add COLUMN \`planId\` int NOT NULL DEFAULT ${planId}`
    );

    // Remove the default value from planId
    await queryRunner.query(
      "ALTER TABLE `subscriptions` ALTER COLUMN `planId` DROP DEFAULT"
    );

    // Drop planName and price
    await queryRunner.query("ALTER TABLE `subscriptions` DROP COLUMN `planName`");
    await queryRunner.query("ALTER TABLE `subscriptions` DROP COLUMN `price`");
  }

  async down(queryRunner) {
    await queryRunner.query("ALTER TABLE `subscriptions` ADD COLUMN `price` decimal(15,2) NOT NULL DEFAULT 50000.00");
    await queryRunner.query("ALTER TABLE `subscriptions` ADD COLUMN `planName` varchar(255) NOT NULL DEFAULT 'Basic Plan'");
    await queryRunner.query("ALTER TABLE `subscriptions` ALTER COLUMN `price` DROP DEFAULT");
    await queryRunner.query("ALTER TABLE `subscriptions` ALTER COLUMN `planName` DROP DEFAULT");
    await queryRunner.query("ALTER TABLE `subscriptions` DROP COLUMN `planId`");
    await queryRunner.query("DROP TABLE `plans`");
  }
};
