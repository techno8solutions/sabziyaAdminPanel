// models/Notification.js
export default (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      delivery_partner_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "delivery_partners",
          key: "id",
        },
      },
      type: {
        type: DataTypes.ENUM(
          "delivery_completed",
          "payment_received",
          "new_delivery",
          "delay_alert",
          "app_update",
          "weekly_earnings",
          "system_alert",
          "rating_received",
          "promotion"
        ),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high", "urgent"),
        defaultValue: "medium",
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "notifications",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        { fields: ["delivery_partner_id"] },
        { fields: ["type"] },
        { fields: ["is_read"] },
        { fields: ["priority"] },
        { fields: ["created_at"] },
      ],
    }
  );

  return Notification;
};
