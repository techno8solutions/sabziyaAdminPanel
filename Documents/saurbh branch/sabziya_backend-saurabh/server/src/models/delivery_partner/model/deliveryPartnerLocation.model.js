// models/delivery_partner_location.model.js
export default (sequelize, DataTypes) => {
  const DeliveryPartnerLocation = sequelize.define(
    "DeliveryPartnerLocation",
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
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false,
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false,
      },
      accuracy_meters: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      speed_kmh: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      heading_degrees: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      battery_level: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "delivery_partner_locations",
      timestamps: true,
      createdAt: "recorded_at",
      updatedAt: false,
      indexes: [
        {
          fields: ["delivery_partner_id"],
        },
        { fields: ["latitude", "longitude"] },
        { fields: ["recorded_at"] },
        {
          name: "dp_loc_status_idx",
          fields: ["delivery_partner_id", "is_active", "recorded_at"],
        },
      ],
    }
  );

  return DeliveryPartnerLocation;
};
