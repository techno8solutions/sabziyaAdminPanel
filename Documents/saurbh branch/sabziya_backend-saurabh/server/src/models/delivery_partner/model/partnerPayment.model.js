export default (sequelize, DataTypes) => {
  const PartnerPayment = sequelize.define(
    "PartnerPayment",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      delivery_partners_id: {
        type: DataTypes.UUID,

        allowNull: true,
        references: {
          model: "delivery_partners",
          key: "id",
        },
      },

      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.ENUM("bank_transfer", "digital_wallet", "cash"),
        defaultValue: "bank_transfer",
      },
      payment_reference: DataTypes.STRING(100),
      status: {
        type: DataTypes.ENUM("pending", "completed", "failed", "cancelled"),
        defaultValue: "pending",
      },
      failure_reason: DataTypes.TEXT,
      processed_at: DataTypes.DATE,
    },
    {
      tableName: "partner_payments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        // { fields: ["batch_id"] },
        { fields: ["partner_id"] },
        { fields: ["status"] },
      ],
    }
  );

  return PartnerPayment;
};
