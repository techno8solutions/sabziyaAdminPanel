import db from "../../../models/index.js";

const { Customer, delivery_partners } = db;

class UserService {
  /** Get all customers with optional filters */
  static async getCustomers(filters = {}) {
    const { status, city } = filters;
    return Customer.findAll({
      where: {
        ...(status && { status }),
        ...(city && { city }),
      },
    });
  }

  /** Update customer profile */
  static async updateCustomer(id, data) {
    const customer = await Customer.findByPk(id);
    if (!customer) throw new Error("Customer not found");

    await customer.update(data);
    return customer;
  }

  /** Block or Unblock customer */
  static async toggleCustomerStatus(id, action) {
    const customer = await Customer.findByPk(id);
    if (!customer) throw new Error("Customer not found");

    customer.status = action === "block" ? "suspended" : "active";
    await customer.save();
    return customer;
  }

  /** Assign role to a delivery partner */
  static async assignRole(userId, role) {
    const partner = await delivery_partners.findByPk(userId);
    if (!partner) throw new Error("User not found");

    partner.role = role;
    await partner.save();
    return partner;
  }
}

export default UserService;
