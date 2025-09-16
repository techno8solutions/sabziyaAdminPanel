export default (sequelize, DataTypes) => {
  const Orders = sequelize.define(
    "Orders",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      customer_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "customers",
          key: "id",
        },
      },
      delivery_address_id: {
        // <--- replace delivery_address
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "delivery_address",
          key: "id",
        },
      },
      delivery_instructions: DataTypes.TEXT,
      order_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "confirmed",
          "preparing",
          "ready_for_delivery",
          "out_for_delivery",
          "delivered",
          "cancelled"
        ),
        defaultValue: "pending",
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      delivery_fee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        validate: { min: 0 },
      },
      tax_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        validate: { min: 0 },
      },
      discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
        validate: { min: 0 },
      },
      payment_method: {
        type: DataTypes.ENUM("credit_card", "debit_card", "cash", "online"),
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
        defaultValue: "pending",
      },
    },
    {
      tableName: "orders",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["customer_id"] },
        { fields: ["status"] },
        { fields: ["order_date"] },
        { fields: ["payment_status"] },
      ],
    }
  );

  return Orders;
};
