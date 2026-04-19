const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Payment",
  tableName: "payments",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    subscriptionId: {
      type: "int",
      nullable: false,
    },
    userId: {
      type: "int",
      nullable: false,
    },
    midtransOrderId: {
      type: "varchar",
      nullable: true,
    },
    midtransTransactionId: {
      type: "varchar",
      nullable: true,
    },
    grossAmount: {
      type: "decimal",
      precision: 15,
      scale: 2,
      nullable: false,
    },
    paymentType: {
      type: "varchar",
      nullable: true,
    },
    paymentStatus: {
      type: "varchar",
      nullable: false,
      default: "pending",
    },
    paymentUrl: {
      type: "varchar",
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
