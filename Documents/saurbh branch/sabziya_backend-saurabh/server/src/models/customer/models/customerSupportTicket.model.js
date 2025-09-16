
export default (sequelize, DataTypes) => {
  const CustomerSupportTicket = sequelize.define(
    "CustomerSupportTicket",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      customer_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      subject: {
        type: DataTypes.STRING(255),
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
        type: DataTypes.ENUM("low", "medium", "high", "urgent"),
        defaultValue: "medium",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "customer_support_tickets",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  // Associations
  CustomerSupportTicket.associate = (models) => {
    CustomerSupportTicket.belongsTo(models.Customer, {
      foreignKey: "customer_id",
      as: "customer",
      onDelete: "CASCADE",
    });

    CustomerSupportTicket.belongsTo(models.Order, {
      foreignKey: "order_id",
      as: "order",
      onDelete: "SET NULL",
    });
  };

  return CustomerSupportTicket;
};
