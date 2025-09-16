export default (sequelize, DataTypes) => {
  const ProductImage = sequelize.define(
    "ProductImage",
    {
      image_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: "product_images",
    }
  );

  return ProductImage;
};
