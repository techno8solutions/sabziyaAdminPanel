export default (sequelize, DataTypes) => {
  const ProductSynonym = sequelize.define(
    "ProductSynonym",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      synonym: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "product_synonym",
      timestamps: false,
    }
  );

  return ProductSynonym;
};
