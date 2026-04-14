module.exports = class InitialSchema1776188970113 {
  name = "InitialSchema1776188970113";

  async up(queryRunner) {
    await queryRunner.query(
      "CREATE TABLE `users` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `phone` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_97672ac88f789774dd47f7c8be` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "CREATE TABLE `subscriptions` (`id` int NOT NULL AUTO_INCREMENT, `userId` int NOT NULL, `planName` varchar(255) NOT NULL, `price` decimal(15,2) NOT NULL, `status` varchar(255) NOT NULL DEFAULT 'pending', `startedAt` datetime NULL, `expiredAt` datetime NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "CREATE TABLE `payments` (`id` int NOT NULL AUTO_INCREMENT, `subscriptionId` int NOT NULL, `userId` int NOT NULL, `midtransOrderId` varchar(255) NULL, `midtransTransactionId` varchar(255) NULL, `grossAmount` decimal(15,2) NOT NULL, `paymentType` varchar(255) NULL, `paymentStatus` varchar(255) NOT NULL DEFAULT 'pending', `paymentUrl` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
  }

  async down(queryRunner) {
    await queryRunner.query("DROP TABLE `payments`");
    await queryRunner.query("DROP TABLE `subscriptions`");
    await queryRunner.query(
      "DROP INDEX `IDX_97672ac88f789774dd47f7c8be` ON `users`",
    );
    await queryRunner.query("DROP TABLE `users`");
  }
};
