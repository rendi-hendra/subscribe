const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Plan",
  tableName: "plans",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
      nullable: false,
    },
    price: {
      type: "decimal",
      precision: 15,
      scale: 2,
      nullable: false,
    },
    durationDays: {
      type: "int",
      nullable: false,
    },
    description: {
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
  },
});
