module.exports = class AddSoftDeleteAndForeignKeys20260420022500 {
  name = "AddSoftDeleteAndForeignKeys20260420022500";

  async up(queryRunner) {
    // 1. Add deletedAt column to all tables
    const tables = ["users", "plans", "subscriptions", "payments", "members", "seasons"];
    for (const table of tables) {
      await queryRunner.query(
        `ALTER TABLE \`${table}\` ADD COLUMN \`deletedAt\` datetime(6) NULL`
      );
    }

    // 2. Add Foreign Keys
    // Subscriptions
    await queryRunner.query(
      "ALTER TABLE `subscriptions` ADD CONSTRAINT `FK_subscriptions_userId` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT"
    );
    await queryRunner.query(
      "ALTER TABLE `subscriptions` ADD CONSTRAINT `FK_subscriptions_planId` FOREIGN KEY (`planId`) REFERENCES `plans`(`id`) ON DELETE RESTRICT"
    );

    // Payments
    await queryRunner.query(
      "ALTER TABLE `payments` ADD CONSTRAINT `FK_payments_subscriptionId` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions`(`id`) ON DELETE RESTRICT"
    );
    await queryRunner.query(
      "ALTER TABLE `payments` ADD CONSTRAINT `FK_payments_userId` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT"
    );

    // Members
    await queryRunner.query(
      "ALTER TABLE `members` ADD CONSTRAINT `FK_members_userId` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT"
    );
    await queryRunner.query(
      "ALTER TABLE `members` ADD CONSTRAINT `FK_members_subscriptionId` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions`(`id`) ON DELETE RESTRICT"
    );

    // Seasons
    await queryRunner.query(
      "ALTER TABLE `seasons` ADD CONSTRAINT `FK_seasons_userId` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT"
    );
  }

  async down(queryRunner) {
    // 1. Remove Foreign Keys
    await queryRunner.query("ALTER TABLE `seasons` DROP FOREIGN KEY `FK_seasons_userId` ");
    await queryRunner.query("ALTER TABLE `members` DROP FOREIGN KEY `FK_members_subscriptionId` ");
    await queryRunner.query("ALTER TABLE `members` DROP FOREIGN KEY `FK_members_userId` ");
    await queryRunner.query("ALTER TABLE `payments` DROP FOREIGN KEY `FK_payments_userId` ");
    await queryRunner.query("ALTER TABLE `payments` DROP FOREIGN KEY `FK_payments_subscriptionId` ");
    await queryRunner.query("ALTER TABLE `subscriptions` DROP FOREIGN KEY `FK_subscriptions_planId` ");
    await queryRunner.query("ALTER TABLE `subscriptions` DROP FOREIGN KEY `FK_subscriptions_userId` ");

    // 2. Drop deletedAt column
    const tables = ["users", "plans", "subscriptions", "payments", "members", "seasons"];
    for (const table of tables) {
      await queryRunner.query(`ALTER TABLE \`${table}\` DROP COLUMN \`deletedAt\``);
    }
  }
};
