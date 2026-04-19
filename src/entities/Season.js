const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Season",
  tableName: "seasons",
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
    refreshToken: {
      type: "varchar",
      nullable: false,
    },
    expiresAt: {
      type: "datetime",
      nullable: false,
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
