export default (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      image_url: {
        type: DataTypes.STRING,
      },
      p_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      p_description: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      stock_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      low_stock_threshold: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      unit: {
        type: DataTypes.STRING(10),
        defaultValue: "kg",
      },
      is_organic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      season: {
        type: DataTypes.ENUM("summer", "monsoon", "winter", "all_season"),
        defaultValue: "all_season",
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.0,
      },
      status: {
        type: DataTypes.ENUM("inactive", "active", "out_of_stock"),
        defaultValue: "inactive",
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "products",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  return Product;
};

// export default (sequelize, DataTypes) => {
//   const Product = sequelize.define(
//     "Product",
//     {
//       id: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         allowNull: false,
//         primaryKey: true,
//         autoIncrement: true,
//       },
//       image_url: {
//         type: DataTypes.STRING,
//       },
//       p_title: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       p_description: {
//         type: DataTypes.TEXT,
//       },
//       price: {
//         type: DataTypes.DECIMAL(10, 2),
//         allowNull: false,
//       },
//       stock_quantity: {
//         type: DataTypes.INTEGER,
//         defaultValue: 0,
//       },
//       unit: {
//         type: DataTypes.STRING(10),
//         defaultValue: "kg",
//       },
//       status: {
//         type: DataTypes.ENUM("inactive", "active"),
//         defaultValue: "inactive",
//       },
//       deleted_at: {
//         type: DataTypes.DATE,
//       },
//     },
//     {
//       tableName: "products",
//       timestamps: true,
//       paranoid: true,
//       deletedAt: "deleted_at",
//     }
//   );

//   return Product;
// };
