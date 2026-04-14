module.exports = class SubscriptionStatusEnum20260415170100 {
  name = "SubscriptionStatusEnum20260415170100";

  async up(queryRunner) {
    await queryRunner.query(
      "UPDATE `subscriptions` SET `status` = 'pending' WHERE `status` NOT IN ('pending', 'active', 'expired', 'cancelled')",
    );
    await queryRunner.query(
      "ALTER TABLE `subscriptions` MODIFY `status` enum('pending', 'active', 'expired', 'cancelled') NOT NULL DEFAULT 'pending'",
    );
  }

  async down(queryRunner) {
    await queryRunner.query(
      "ALTER TABLE `subscriptions` MODIFY `status` varchar(255) NOT NULL DEFAULT 'pending'",
    );
  }
};
