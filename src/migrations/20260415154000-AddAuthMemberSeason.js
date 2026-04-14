module.exports = class AddAuthMemberSeason20260415154000 {
  name = "AddAuthMemberSeason20260415154000";

  async up(queryRunner) {
    await queryRunner.query(
      "ALTER TABLE `users` ADD COLUMN `password` varchar(255) NULL AFTER `phone`",
    );
    await queryRunner.query(
      "CREATE TABLE `members` (`id` int NOT NULL AUTO_INCREMENT, `userId` int NOT NULL, `subscriptionId` int NOT NULL, `status` varchar(255) NOT NULL DEFAULT 'active', `startedAt` datetime NULL, `expiredAt` datetime NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "CREATE TABLE `seasons` (`id` int NOT NULL AUTO_INCREMENT, `userId` int NOT NULL, `refreshToken` varchar(255) NOT NULL, `expiresAt` datetime NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
  }

  async down(queryRunner) {
    await queryRunner.query("DROP TABLE `seasons`");
    await queryRunner.query("DROP TABLE `members`");
    await queryRunner.query("ALTER TABLE `users` DROP COLUMN `password`");
  }
};
