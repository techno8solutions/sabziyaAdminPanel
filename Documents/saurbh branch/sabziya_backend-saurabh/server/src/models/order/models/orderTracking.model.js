export default (sequelize, DataTypes) => {
  const OrderTracking = sequelize.define(
    "OrderTracking",
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
      assignment_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
          model: "order_assignments",
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM(
          "order_placed",
          "confirmed",
          "preparing",
          "ready_for_pickup",
          "partner_assigned",
          "out_for_delivery",
          "picked_up",
          "in_transit",
          "delivered",
          "cancelled"
        ),
        allowNull: false,
      },
      latitude: DataTypes.DECIMAL(10, 8),
      longitude: DataTypes.DECIMAL(11, 8),
      notes: DataTypes.TEXT,
    },
    {
      tableName: "order_tracking",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        { fields: ["order_id"] },
        { fields: ["status"] },
        { fields: ["created_at"] },
      ],
    }
  );

  return OrderTracking;
};
