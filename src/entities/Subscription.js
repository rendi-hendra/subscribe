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
    planId: {
      type: "int",
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
    deletedAt: {
      type: "datetime",
      deleteDate: true,
      nullable: true,
    },
  },
});
