export default (sequelize, DataTypes) => {
  const OrderAssignment = sequelize.define(
    "OrderAssignment",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "orders",
          key: "id",
        },
      },
      delivery_partner_id: {
        type: DataTypes.UUID,

        allowNull: true,
        references: {
          model: "delivery_partners",
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM(
          "assigned",
          "accepted",
          "rejected",
          "picked_up",
          "delivered",
          "cancelled"
        ),
        defaultValue: "assigned",
      },
      assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      accepted_at: DataTypes.DATE,
      rejected_at: DataTypes.DATE,
      picked_up_at: DataTypes.DATE,
      delivered_at: DataTypes.DATE,
      rejection_reason: DataTypes.TEXT,
      delivery_notes: DataTypes.TEXT,
      estimated_pickup_time: DataTypes.DATE,
      estimated_delivery_time: DataTypes.DATE,
      actual_pickup_time: DataTypes.DATE,
      actual_delivery_time: DataTypes.DATE,
    },
    {
      tableName: "order_assignments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["order_id"] },
        { fields: ["delivery_partner_id"] },
        { fields: ["status"] },
        { fields: ["assigned_at"] },
      ],
    }
  );

  return OrderAssignment;
};
