export default (sequelize, DataTypes) => {
  const CustomerVerification = sequelize.define(
    "CustomerVerification",
    {
      customer_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "customers", // ✅ must match actual table name
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      email_is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      phone_number_is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: true, // will store verification token
      },
      token_expires_at: {
        type: DataTypes.DATE,
        allowNull: true, // optional expiration date for security
      },
    },
    {
      timestamps: true,
      tableName: "customer_verifications",
    }
  );

  return CustomerVerification;
};
