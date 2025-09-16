// models/associations.js

const checkModelsExist = (models, required, logger) => {
  const missing = required.filter((n) => !models[n]);
  if (missing.length) {
    logger?.warn?.(
      `⚠️  Missing models for associations: ${missing.join(", ")}`
    );
    return false;
  }
  return true;
};

const setupProductAssociations = (db, logger) => {
  if (!checkModelsExist(db, ["Product"], logger)) return;

  const {
    Product,
    ProductSynonym,
    Category,
    ProductImage,
    OrderItems, // fixed here too if plural in db
    RecipeComboItem,
  } = db;

  if (ProductSynonym) {
    Product.hasMany(ProductSynonym, {
      foreignKey: "product_id",
      as: "synonyms",
      onDelete: "CASCADE",
    });
    ProductSynonym.belongsTo(Product, {
      foreignKey: "product_id",
      as: "product",
    });
  }

  if (Category) {
    Product.belongsToMany(Category, {
      through: "product_category",
      as: "categories",
      foreignKey: "product_id",
      otherKey: "category_id",
      timestamps: false,
    });
    Category.belongsToMany(Product, {
      through: "product_category",
      as: "products",
      foreignKey: "category_id",
      otherKey: "product_id",
      timestamps: false,
    });
  }

  if (ProductImage) {
    Product.hasMany(ProductImage, {
      foreignKey: "product_id",
      as: "images",
      onDelete: "CASCADE",
    });
    ProductImage.belongsTo(Product, {
      foreignKey: "product_id",
      as: "product",
    });
  }

  if (OrderItems) {
    Product.hasMany(OrderItems, { foreignKey: "product_id", as: "orderItems" });
    OrderItems.belongsTo(Product, { foreignKey: "product_id", as: "product" });
  }

  if (RecipeComboItem) {
    Product.hasMany(RecipeComboItem, {
      foreignKey: "product_id",
      as: "recipeComboItems",
    });
    RecipeComboItem.belongsTo(Product, {
      foreignKey: "product_id",
      as: "product",
    });
  }
};

const setupOrderAssociations = (db, logger) => {
  // fixed: OrderItem → OrderItems
  if (
    !checkModelsExist(db, ["Orders", "OrderItems", "OrderAssignment"], logger)
  )
    return;

  const {
    Customer,
    Orders,
    OrderItems, // plural here
    Payment,
    OrderCommunication,
    OrderTracking,
    OrderAssignment,
  } = db;

  if (Customer) {
    Customer.hasMany(Orders, { foreignKey: "customer_id", as: "orders" });
    Orders.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });
  }

  Orders.hasMany(OrderItems, {
    foreignKey: "order_id",
    as: "items",
    onDelete: "CASCADE",
  });
  OrderItems.belongsTo(Orders, { foreignKey: "order_id", as: "order" });

  if (Payment) {
    Orders.hasOne(Payment, {
      foreignKey: "order_id",
      as: "payment",
      onDelete: "CASCADE",
    });
    Payment.belongsTo(Orders, { foreignKey: "order_id", as: "order" });
  }

  if (OrderCommunication) {
    Orders.hasMany(OrderCommunication, {
      foreignKey: "order_id",
      as: "communications",
      onDelete: "CASCADE",
    });
    OrderCommunication.belongsTo(Orders, {
      foreignKey: "order_id",
      as: "order",
    });
  }

  if (OrderTracking) {
    Orders.hasMany(OrderTracking, {
      foreignKey: "order_id",
      as: "trackingHistory",
      onDelete: "CASCADE",
    });
    OrderTracking.belongsTo(Orders, { foreignKey: "order_id", as: "order" });
  }

  Orders.hasMany(OrderAssignment, {
    foreignKey: "order_id",
    as: "assignments",
  });
  OrderAssignment.belongsTo(Orders, { foreignKey: "order_id", as: "order" });
};

const setupRecipeComboAssociations = (db, logger) => {
  if (!checkModelsExist(db, ["RecipeCombo", "RecipeComboItem"], logger)) return;

  const { RecipeCombo, RecipeComboItem } = db;

  RecipeCombo.hasMany(RecipeComboItem, {
    foreignKey: "combo_id",
    as: "items",
    onDelete: "CASCADE",
  });
  RecipeComboItem.belongsTo(RecipeCombo, {
    foreignKey: "combo_id",
    as: "combo",
  });
};

const setupDeliveryPartnerAssociations = (db, logger) => {
  if (!checkModelsExist(db, ["delivery_partners", "OrderAssignment"], logger))
    return;

  const {
    delivery_partners,
    delivery_partners_registration,
    DeliveryPartnerLocation,
    DeliveryZone,
    PartnerZoneAssignment,
    OrderAssignment,
    OrderTracking,
    PartnerEarning,
    PartnerPaymentBatch,
    PartnerPayment,
  } = db;

  if (delivery_partners_registration) {
    delivery_partners.hasOne(delivery_partners_registration, {
      foreignKey: "delivery_partner_id",
      as: "registration",
      onDelete: "CASCADE",
    });
    delivery_partners_registration.belongsTo(delivery_partners, {
      foreignKey: "delivery_partner_id",
      as: "deliveryPartner",
    });
  }

  if (DeliveryPartnerLocation) {
    delivery_partners.hasMany(DeliveryPartnerLocation, {
      foreignKey: "delivery_partner_id",
      as: "locations",
      onDelete: "CASCADE",
    });
    DeliveryPartnerLocation.belongsTo(delivery_partners, {
      foreignKey: "delivery_partner_id",
      as: "deliveryPartner",
    });
  }

  if (delivery_partners_registration && DeliveryZone && PartnerZoneAssignment) {
    delivery_partners_registration.belongsToMany(DeliveryZone, {
      through: PartnerZoneAssignment,
      foreignKey: "partner_id", // adjust if your join table uses delivery_partner_id
      otherKey: "zone_id",
      as: "zones",
    });
    DeliveryZone.belongsToMany(delivery_partners_registration, {
      through: PartnerZoneAssignment,
      foreignKey: "zone_id",
      otherKey: "partner_id",
      as: "partners",
    });
  }

  delivery_partners.hasMany(OrderAssignment, {
    foreignKey: "delivery_partner_id",
    as: "assignments",
  });
  OrderAssignment.belongsTo(delivery_partners, {
    foreignKey: "delivery_partner_id",
    as: "deliveryPartner",
  });

  if (OrderTracking) {
    OrderAssignment.hasMany(OrderTracking, {
      foreignKey: "assignment_id",
      as: "trackingUpdates",
      onDelete: "CASCADE",
    });
    OrderTracking.belongsTo(OrderAssignment, {
      foreignKey: "assignment_id",
      as: "assignment",
    });
  }

  if (PartnerEarning) {
    delivery_partners.hasMany(PartnerEarning, {
      foreignKey: "partner_id",
      as: "earnings",
    });
    PartnerEarning.belongsTo(delivery_partners, {
      foreignKey: "partner_id",
      as: "deliveryPartner",
    });

    OrderAssignment.hasOne(PartnerEarning, {
      foreignKey: "order_assignment_id",
      as: "earning",
      onDelete: "CASCADE",
    });
    PartnerEarning.belongsTo(OrderAssignment, {
      foreignKey: "order_assignment_id",
      as: "assignment",
    });
  }

  if (PartnerPayment) {
    delivery_partners.hasMany(PartnerPayment, {
      foreignKey: "partner_id",
      as: "payments",
    });
    PartnerPayment.belongsTo(delivery_partners, {
      foreignKey: "partner_id",
      as: "deliveryPartner",
    });
  }

  if (PartnerPaymentBatch && PartnerPayment) {
    PartnerPaymentBatch.hasMany(PartnerPayment, {
      foreignKey: "batch_id",
      as: "payments",
    });
    PartnerPayment.belongsTo(PartnerPaymentBatch, {
      foreignKey: "batch_id",
      as: "batch",
    });
  }
};

const setupAdminAssociations = (db, logger) => {
  const { Admin, OtpLog } = db;
  if (!Admin) return;
  if (OtpLog) {
    Admin.hasMany(OtpLog, { foreignKey: "admin_id", as: "otpLogs" });
    OtpLog.belongsTo(Admin, { foreignKey: "admin_id", as: "admin" });
  }
};

const applyAssociations = (db, logger) => {
  logger?.info?.("🔗 Setting up model associations...");
  setupProductAssociations(db, logger);
  setupOrderAssociations(db, logger);
  setupRecipeComboAssociations(db, logger);
  setupDeliveryPartnerAssociations(db, logger);
  setupAdminAssociations(db, logger);
  logger?.info?.("✅ All model associations set up successfully!");
};

export default applyAssociations;
