export default (sequelize, DataTypes) => {
  const ProductCategory = sequelize.define(
    "ProductCategory",
    {
      product_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true, // part of composite key
      },
      category_id: {
        type: DataTypes.BIGINT.UNSIGNED, // FIX: should match categories.id type
        allowNull: false,
        primaryKey: true, // part of composite key
      },
      added_by: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      added_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: false,
      tableName: "product_category",
    }
  );

  return ProductCategory;
};
