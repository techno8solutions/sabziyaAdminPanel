import bcrypt from "bcryptjs";

export default (sequelize, DataTypes) => {
  const delivery_partners = sequelize.define(
    "delivery_partners",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      // Common delivery_partners fields
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: DataTypes.STRING(100),
      email: {
        type: DataTypes.STRING(100),
        unique: true,
        validate: { isEmail: true },
      },
      phone: {
        type: DataTypes.STRING(20),
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        unique: true,
      },
      is_registered: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(
          "customer",
          "delivery_partner",
          "admin",
          "restaurant_owner"
        ),
        defaultValue: "customer",
        allowNull: false,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      password_reset_token: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      password_reset_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      email_verification_token: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      profile_picture: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      login_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      availability_status: {
        type: DataTypes.ENUM(
          "Online",
          "Offline",
          "Busy",
          "Order Assigned",
          "On Delivery"
        ),
        defaultValue: "offline",
      },
      verification_status: {
        type: DataTypes.ENUM("pending", "verified", "rejected", "expired"),
        defaultValue: "pending",
      },
      total_deliveries: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      successful_deliveries: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      rating_average: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.0,
      },
      total_ratings: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      commission_rate: {
        type: DataTypes.DECIMAL(5, 4),
        defaultValue: 0.15,
      },
      device_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      device_type: {
        type: DataTypes.ENUM("ios", "android", "web"),
        allowNull: true,
      },
      timezone: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      language: {
        type: DataTypes.STRING(10),
        defaultValue: "en",
        allowNull: false,
      },
    },
    {
      tableName: "delivery_partners",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["email"],
        },
        {
          unique: true,
          fields: ["phone"],
        },
        {
          fields: ["role"],
        },
        {
          fields: ["is_verified"],
        },
        {
          fields: ["is_active"],
        },
      ],
      // hooks: {
      //   beforeCreate: async (delivery_partners) => {
      //     if (delivery_partners.password) {
      //       const salt = await bcrypt.genSalt(10);
      //       delivery_partners.password = await bcrypt.hash(
      //         delivery_partners.password,
      //         salt
      //       );
      //     }
      //   },
      //   beforeUpdate: async (delivery_partners) => {
      //     if (delivery_partners.changed("password")) {
      //       const salt = await bcrypt.genSalt(10);
      //       delivery_partners.password = await bcrypt.hash(
      //         delivery_partners.password,
      //         salt
      //       );
      //     }
      //   },
      // },
      scopes: {
        withPassword: {
          attributes: {},
        },
      },
    }
  );

  // // Instance method to compare password
  // delivery_partners.prototype.comparePassword = async function (
  //   candidatePassword
  // ) {
  //   return await bcrypt.compare(candidatePassword, this.password);
  // };

  // // Instance method to generate JWT token
  // delivery_partners.prototype.generateAuthToken = function () {
  //   return jwt.sign({ id: this.id, role: this.role }, process.env.JWT_SECRET, {
  //     expiresIn: process.env.JWT_EXPIRES_IN,
  //   });
  // };

  // // Instance method to generate password reset token
  // delivery_partners.prototype.generatePasswordResetToken = function () {
  //   const resetToken = crypto.randomBytes(20).toString("hex");
  //   this.password_reset_token = crypto
  //     .createHash("sha256")
  //     .update(resetToken)
  //     .digest("hex");
  //   this.password_reset_expires = Date.now() + 10 * 60 * 1000; // 10 minutes
  //   return resetToken;
  // };

  return delivery_partners;
};
