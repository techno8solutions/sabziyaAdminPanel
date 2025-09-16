export default (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      payment_gateway: {
        type: DataTypes.STRING,
      },
      transaction_id: {
        type: DataTypes.STRING,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
      },
      status: {
        type: DataTypes.ENUM("success", "failed", "pending"),
        defaultValue: "pending",
      },
      paid_at: {
        type: DataTypes.DATE,
      },
    },
    {
      timestamps: true,
      tableName: "payments",
    }
  );

  return Payment;
};
