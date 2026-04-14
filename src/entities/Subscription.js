const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Subscription",
  tableName: "subscriptions",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    userId: {
      type: "int",
      nullable: false,
    },
    planName: {
      type: "varchar",
      nullable: false,
    },
    price: {
      type: "decimal",
      precision: 15,
      scale: 2,
      nullable: false,
    },
    status: {
      type: "enum",
      enum: ["pending", "active", "expired", "cancelled"],
      nullable: false,
      default: "pending",
    },
    startedAt: {
      type: "datetime",
      nullable: true,
    },
    expiredAt: {
      type: "datetime",
      nullable: true,
    },
    createdAt: {
      type: "datetime",
      createDate: true,
    },
    updatedAt: {
      type: "datetime",
      updateDate: true,
    },
  },
});
