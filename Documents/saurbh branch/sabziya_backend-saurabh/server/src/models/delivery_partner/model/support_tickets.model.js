// models/support_tickets.model.js - FIXED VERSION
export default (sequelize, DataTypes) => {
  const SupportTicket = sequelize.define(
    "support_tickets",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED, // Changed from INTEGER
        autoIncrement: true,
        primaryKey: true,
      },
      partner_id: {
        // Changed from partnerId to match association
        type: DataTypes.UUID, // Must match delivery_partners id type
        allowNull: false,
        references: {
          model: "delivery_partners",
          key: "id",
        },
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("open", "in_progress", "resolved", "closed"),
        defaultValue: "open",
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high"),
        defaultValue: "medium",
      },
    },
    {
      tableName: "support_tickets",
      underscored: true, // 👈 maps createdAt -> created_at automatically
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return SupportTicket;
};
