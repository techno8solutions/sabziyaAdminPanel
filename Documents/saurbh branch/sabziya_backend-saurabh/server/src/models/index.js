import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
import config from "../config/development.js";
import { fileURLToPath } from "url";
import { pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Sequelize
export const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port || 3306, // Default MySQL port
    dialect: "mysql",
    logging: false,
  }
);

// Load all models dynamically
const getAllModelFiles = (dirPath, arrayOfFiles = []) => {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllModelFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith(".model.js")) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
};

// Load all models dynamically
const db = {};
const modelPaths = getAllModelFiles(__dirname);

for (const filePath of modelPaths) {
  const modelModule = await import(pathToFileURL(filePath).href); // ✅ Correct

  const model = modelModule.default(sequelize, DataTypes);
  db[model.name] = model;
}

// ================== Associations ================== //
// (You can safely use optional chaining here if models might be missing)

const {
  Admin,
  Category,
  Customer,
  Cart,
  CustomerVerification,
  CustomerSupportTicket,
  delivery_partners_registration,
  DeliveryPartnerLocation,
  delivery_partners,
  DeliveryAddress,
  Notification,
  DeliveryZone,
  PartnerEarning,
  PartnerPayment,
  PartnerZoneAssignment,
  Orders,
  OrderAssignment,
  OrderCommunication,
  OrderItems,
  OrderTracking,
  support_tickets,
  SupportTicket,
  OrderOTP,
  Otp_logs,
  Payment,
  Product,
  ProductCategory,
  ProductImage,
  ProductSynonym,
  RecipeCombo,
  RecipeComboItem,
} = db;

// console.log("Models loaded :", Object.keys(db).join(","));

// Example associations
Product?.hasMany(ProductSynonym, { foreignKey: "product_id", as: "synonyms" });
ProductSynonym?.belongsTo(Product, { foreignKey: "product_id" });

Product?.belongsToMany(Category, {
  through: "product_category",
  as: "categories",
  foreignKey: "product_id",
  otherKey: "category_id",
});
Category?.belongsToMany(Product, {
  through: "product_category",
  as: "products",
  foreignKey: "category_id",
  otherKey: "product_id",
});

// customer verifications
// Customer ⇄ CustomerVerification (One-to-One)
Customer?.hasOne(CustomerVerification, {
  foreignKey: "customer_id",
  as: "verification",
  onDelete: "CASCADE",
});
CustomerVerification?.belongsTo(Customer, {
  foreignKey: "customer_id",
  as: "customer",
});
// 3. Customer ⇄ Orders
Customer.hasMany(Orders, { foreignKey: "customer_id", as: "orders" });
Orders.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });

// Customer ⇄ Cart
Customer.hasMany(Cart, { foreignKey: "customer_id", as: "cartItems" });
Cart.belongsTo(Customer, { foreignKey: "customer_id", as: "customer" });

// Product ⇄ Cart
Product.hasMany(Cart, { foreignKey: "product_id", as: "cartEntries" });
Cart.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// 1️⃣ A customer can have multiple delivery addresses
Customer.hasMany(DeliveryAddress, {
  foreignKey: "customer_id",
  as: "addresses",
  onDelete: "CASCADE",
});
  // One Customer can have many Support Tickets
  Customer.hasMany(CustomerSupportTicket, {
    foreignKey: "customer_id",
    as: "supportTickets",
    onDelete: "CASCADE",   // If a customer is deleted, delete their tickets
  });

  // Each Support Ticket belongs to a single Customer
  CustomerSupportTicket.belongsTo(Customer, {
    foreignKey: "customer_id",
    as: "customer",
  });
   
  // optional: if ticket is related to order
Orders.hasMany(CustomerSupportTicket, { foreignKey: "order_id" });
CustomerSupportTicket.belongsTo(Orders, { as: "order",foreignKey: "order_id" });

DeliveryAddress.belongsTo(Customer, {
  foreignKey: "customer_id",
  as: "customer",
});

DeliveryAddress.hasMany(Orders, {
  foreignKey: "delivery_address_id",
  as: "orders",
});
Orders.belongsTo(DeliveryAddress, {
  foreignKey: "delivery_address_id",
  as: "deliveryAddress",
});


// 4. Order ⇄ Items
Orders.hasMany(OrderItems, { foreignKey: "order_id", as: "items" });
OrderItems.belongsTo(Orders, { foreignKey: "order_id" });

// 5. Product ⇄ OrderItems
Product.hasMany(OrderItems, { foreignKey: "product_id" });
OrderItems.belongsTo(Product, { foreignKey: "product_id" ,as: "product"});
Product.hasMany(ProductImage, {
  foreignKey: "product_id",
  as: "images",
});
ProductImage.belongsTo(Product, {
  foreignKey: "product_id",
});


ProductSynonym.belongsTo(Product, {
  foreignKey: "product_id",
});

Product.belongsTo(Category, {
  foreignKey: "category",
  targetKey: "name",
  as: "categoryData",
});
// 6. Order ⇄ Payment
Orders.hasOne(Payment, { foreignKey: "order_id", as: "payment" });
Payment.belongsTo(Orders, { foreignKey: "order_id" });

// 7. RecipeCombo ⇄ Items
RecipeCombo.hasMany(RecipeComboItem, {
  foreignKey: "combo_id",
  as: "items",
});
RecipeComboItem.belongsTo(RecipeCombo, { foreignKey: "combo_id" });

// 8. Product ⇄ RecipeComboItems
Product.hasMany(RecipeComboItem, { foreignKey: "product_id" });
RecipeComboItem.belongsTo(Product, { foreignKey: "product_id" });

ProductImage.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});
// delivery_partners ⇄ delivery_partners_registration (One-to-One)
delivery_partners.hasOne(delivery_partners_registration, {
  foreignKey: "delivery_partner_id",
  as: "registration",
});
delivery_partners_registration.belongsTo(delivery_partners, {
  foreignKey: "delivery_partner_id",
  as: "partnerAccount",
});

// delivery_partners_registration ⇄ Locations (One-to-Many)
delivery_partners_registration.hasMany(DeliveryPartnerLocation, {
  foreignKey: "partner_id",
  as: "locations",
});
DeliveryPartnerLocation.belongsTo(delivery_partners_registration, {
  foreignKey: "partner_id",
  as: "partner",
});

// delivery_partners_registration ⇄ ZoneAssignments (Many-to-Many through PartnerZoneAssignment)
delivery_partners_registration.belongsToMany(DeliveryZone, {
  through: PartnerZoneAssignment,
  foreignKey: "partner_id",
  as: "zones",
});
DeliveryZone.belongsToMany(delivery_partners_registration, {
  through: PartnerZoneAssignment,
  foreignKey: "zone_id",
  as: "partners",
});

// delivery_partners_registration ⇄ OrderAssignments (One-to-Many)
delivery_partners_registration.hasMany(OrderAssignment, {
  foreignKey: "delivery_partner_id",
  as: "assignments",
});

OrderAssignment.belongsTo(delivery_partners_registration, {
  foreignKey: "delivery_partner_id",
  as: "partnerRegistration",
});
OrderAssignment.hasMany(OrderTracking, {
  foreignKey: "assignment_id",
  as: "trackingUpdates",
});

// Order ⇄ OrderAssignments (One-to-Many)
Orders.hasMany(OrderAssignment, {
  foreignKey: "order_id",
  as: "assignments",
});
OrderAssignment.belongsTo(Orders, {
  foreignKey: "order_id",
  as: "order",
});

OrderTracking.belongsTo(OrderAssignment, {
  foreignKey: "assignment_id",
  as: "assignment",
});

// Order ⇄ OrderTracking (One-to-Many)
Orders.hasMany(OrderTracking, {
  foreignKey: "order_id",
  as: "trackingHistory",
});
OrderTracking.belongsTo(Orders, {
  foreignKey: "order_id",
  as: "order",
});

// delivery_partners_registration ⇄ PartnerEarnings (One-to-Many)
delivery_partners_registration.hasMany(PartnerEarning, {
  foreignKey: "partner_id",
  as: "earnings",
});
PartnerEarning.belongsTo(delivery_partners_registration, {
  foreignKey: "partner_id",
  as: "partner",
});

// OrderAssignment ⇄ PartnerEarnings (One-to-One)
OrderAssignment.hasOne(PartnerEarning, {
  foreignKey: "order_assignment_id",
  as: "earning",
});
PartnerEarning.belongsTo(OrderAssignment, {
  foreignKey: "order_assignment_id",
  as: "assignment",
});

// // PartnerPaymentBatch ⇄ PartnerPayments (One-to-Many)
// PartnerPaymentBatch.hasMany(PartnerPayment, {
//   foreignKey: "batch_id",
//   as: "payments",
// });
// PartnerPayment.belongsTo(PartnerPaymentBatch, {
//   foreignKey: "batch_id",
//   as: "batch",
// });

// delivery_partners_registration ⇄ PartnerPayments (One-to-Many)
delivery_partners_registration.hasMany(PartnerPayment, {
  foreignKey: "partner_id",
  as: "payments",
});
PartnerPayment.belongsTo(delivery_partners_registration, {
  foreignKey: "partner_id",
  as: "partner",
});

// Order ⇄ OrderCommunications (One-to-Many)
Orders.hasMany(OrderCommunication, {
  foreignKey: "order_id",
  as: "communications",
});
OrderCommunication.belongsTo(Orders, {
  foreignKey: "order_id",
  as: "order",
});

// delivery_partners ⇄ OrderCommunications (as sender - One-to-Many)
delivery_partners.hasMany(OrderCommunication, {
  foreignKey: "sender_id",
  as: "sentMessages",
});
OrderCommunication.belongsTo(delivery_partners, {
  foreignKey: "sender_id",
  as: "sender",
});

// delivery_partners ⇄ OrderCommunications (as recipient - One-to-Many)
delivery_partners.hasMany(OrderCommunication, {
  foreignKey: "recipient_id",
  as: "receivedMessages",
});
OrderCommunication.belongsTo(delivery_partners, {
  foreignKey: "recipient_id",
  as: "recipient",
});

// ================== Export ================== //
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
export { Admin, Category, Customer, Orders };
