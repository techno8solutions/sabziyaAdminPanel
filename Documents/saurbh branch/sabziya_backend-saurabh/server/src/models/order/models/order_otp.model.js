export default (sequelize, DataTypes) => {
  const OrderOTP = sequelize.define(
    "OrderOTP",
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
      phone_number: {
        type: DataTypes.STRING(15),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      otp_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          len: [4, 10], // Ensures OTP is between 4-10 characters
        },
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      purpose: {
        type: DataTypes.ENUM(
          "delivery_verification",
          "customer_verification",
          "partner_verification",
          "order_modification"
        ),
        allowNull: false,
      },
      expires_at: {
        // Added expiration field
        type: DataTypes.DATE,
        allowNull: false,
        // defaultValue: sequelize.literal("DATE_ADD(NOW(), INTERVAL 15 MINUTE)"), // MySQL syntax
      },
      verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      attempts: {
        // Added to track failed attempts
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "order_otps", // Consistent naming
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["order_id"],
        },
        {
          fields: ["phone_number"],
        },
        {
          fields: ["is_verified"],
        },
        {
          fields: ["expires_at"],
        },
      ],
      hooks: {
        beforeCreate: (otp) => {
          // You can add custom logic here if needed
          if (!otp.expires_at) {
            otp.expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
          }
        },
      },
    }
  );

  // Add association to Order model if needed
  OrderOTP.associate = (models) => {
    OrderOTP.belongsTo(models.Order, {
      foreignKey: "order_id",
      as: "order",
    });
  };

  return OrderOTP;
};
