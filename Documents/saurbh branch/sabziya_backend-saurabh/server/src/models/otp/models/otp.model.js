export default (sequelize, DataTypes) => {
  const Otp_logs = sequelize.define(
    "Otp_logs",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      phone_number: {
        type: DataTypes.STRING(15),
      },
      user_id: {
        type: DataTypes.STRING(50),
      },
      email: {
        type: DataTypes.STRING(50),
      },
      otp_code: {
        type: DataTypes.STRING(10),
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      purpose: {
        type: DataTypes.ENUM("login", "register", "reset_password"),
      },
      verified_at: {
        type: DataTypes.DATE,
      },
      type: {
        type: DataTypes.STRING(50), // for example: "email_verification"
      },
      expires_at: {
        type: DataTypes.DATE,
      },
      used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      tableName: "otp_logs",
    }
  );

  return Otp_logs;
};
