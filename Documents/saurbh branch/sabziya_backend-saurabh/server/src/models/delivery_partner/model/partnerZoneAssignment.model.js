export default (sequelize, DataTypes) => {
  const PartnerZoneAssignment = sequelize.define(
    "PartnerZoneAssignment",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      partner_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "delivery_partners",
          key: "id",
        },
      },
      zone_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "delivery_zones",
          key: "id",
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "partner_zone_assignments",
      timestamps: true,
      createdAt: "assigned_at",
      updatedAt: false,
      indexes: [
        { fields: ["partner_id"] },
        { fields: ["zone_id"] },
        { fields: ["is_active"] },
        { fields: ["partner_id", "zone_id"], unique: true },
      ],
    }
  );

  return PartnerZoneAssignment;
};
