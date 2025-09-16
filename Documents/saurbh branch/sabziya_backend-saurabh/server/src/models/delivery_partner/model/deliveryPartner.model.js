export default (sequelize, DataTypes) => {
  const DeliveryPartner = sequelize.define(
    "delivery_partners_registration",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      delivery_partner_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "delivery_partners",
          key: "id",
        },
      },
      partner_code: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: true,
      },
      vehicle_type: {
        type: DataTypes.ENUM("bicycle", "motorcycle", "car", "van"),
        allowNull: false,
      },
      emergency_contact_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      emergency_contact_number: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      street_address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      postal_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      government_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      vehicle_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      license_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      license_expiry: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      insurance_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      insurance_expiry: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      DOB: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      onboarding_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      profile_photo_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      license_photo_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      vehicle_photo_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      visa_type: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      ni_number: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      availability_schedule: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      account_holder_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      account_number: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      sort_code: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      // student_visa: {
      //   type: DataTypes.INTEGER,
      //   defaultValue: 0,
      // },
      // psw_visa: {
      //   type: DataTypes.INTEGER,
      //   defaultValue: 0,
      // },
      residential_proof: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "delivery_partners_registration",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["partner_code"] }],
    }
  );

  return DeliveryPartner;
};
