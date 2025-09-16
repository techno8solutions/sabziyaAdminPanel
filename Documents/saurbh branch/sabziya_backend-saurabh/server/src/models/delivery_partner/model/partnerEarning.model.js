export default (sequelize, DataTypes) => {
  const PartnerEarning = sequelize.define(
    "PartnerEarning",
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
      order_assignment_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "order_assignments",
          key: "id",
        },
      },
      base_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      bonus_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      tip_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      penalty_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      total_earnings: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "paid", "failed", "disputed"),
        defaultValue: "pending",
      },
      payment_date: DataTypes.DATE,
      payment_reference: DataTypes.STRING(100),
      working_hrs: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "partner_earnings",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [{ fields: ["partner_id"] }, { fields: ["payment_status"] }],
    }
  );

  return PartnerEarning;
};
