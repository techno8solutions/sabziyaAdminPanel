export default (sequelize, DataTypes) => {
  const DeliveryZone = sequelize.define(
    "DeliveryZone",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      zone_code: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
      },
      geometry: {
        type: DataTypes.GEOMETRY,
        allowNull: false,
      },
      city: DataTypes.STRING(100),
      state: DataTypes.STRING(100),
      country: DataTypes.STRING(100),
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      max_delivery_partners: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
      },
    },
    {
      tableName: "delivery_zones",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        { fields: ["zone_code"] },
        { fields: ["geometry"] },
        { fields: ["city", "state"] },
        { fields: ["is_active"] },
      ],
    }
  );

  return DeliveryZone;
};
