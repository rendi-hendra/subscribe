const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Member",
  tableName: "members",
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
    subscriptionId: {
      type: "int",
      nullable: false,
    },
    status: {
      type: "varchar",
      nullable: false,
      default: "active",
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
