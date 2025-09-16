export default (sequelize, DataTypes) => {
  const OrderCommunication = sequelize.define(
    "OrderCommunication",
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
      sender_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        // references: {
        //   model: "users", // delivery person or customer
        //   key: "id",
        // },
      },
      recipient_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        // references: {
        //   model: "users",  // delivery person or customer
        //   key: "id",
        // },
      },
      message_type: {
        type: DataTypes.ENUM("text", "audio", "image", "system"),
        defaultValue: "text",
      },
      content: DataTypes.TEXT,
      media_url: DataTypes.STRING(500),
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "order_communications",
      timestamps: true,
      createdAt: "sent_at",
      updatedAt: false,
      indexes: [
        { fields: ["order_id"] },
        { fields: ["sender_id"] },
        { fields: ["recipient_id"] },
        { fields: ["sent_at"] },
      ],
    }
  );

  return OrderCommunication;
};
