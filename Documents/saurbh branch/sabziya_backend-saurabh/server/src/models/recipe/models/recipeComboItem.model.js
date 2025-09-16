export default (sequelize, DataTypes) => {
  const RecipeComboItem = sequelize.define(
    "RecipeComboItem",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 2),
      },
      unit: {
        type: DataTypes.STRING(10),
      },
    },
    {
      tableName: "recipe_combo_item",
      timestamps: false, // assuming you don’t want createdAt/updatedAt
    }
  );

  return RecipeComboItem;
};
