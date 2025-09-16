class CustomerService {
  // Get all customers with pagination and filters
  async getCustomers(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search = "",
        status = "all",
        sortBy = "created_at",
        sortOrder = "DESC",
      } = options;

      const offset = (page - 1) * limit;
      let whereClause = { role: "customer" };

      // Search filter
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ];
      }

      // Status filter
      if (status !== "all") {
        whereClause.status = status;
      }

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder]],
        attributes: { exclude: ["password"] },
      });

      return {
        customers: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      };
    } catch (error) {
      throw new Error(`Get customers error: ${error.message}`);
    }
  }

  // Get customer details with order history
  async getCustomerDetails(customerId) {
    try {
      const customer = await User.findOne({
        where: {
          id: customerId,
          role: "customer",
        },
        attributes: { exclude: ["password"] },
        include: [
          {
            model: Order,
            limit: 10,
            order: [["created_at", "DESC"]],
          },
        ],
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      // Get customer statistics
      const orderStats = await Order.findOne({
        attributes: [
          [fn("COUNT", col("id")), "totalOrders"],
          [fn("SUM", col("total_amount")), "totalSpent"],
          [fn("AVG", col("total_amount")), "averageOrderValue"],
        ],
        where: { customer_id: customerId },
        raw: true,
      });

      return {
        customer,
        stats: {
          totalOrders: parseInt(orderStats?.totalOrders || 0),
          totalSpent: parseFloat(orderStats?.totalSpent || 0),
          averageOrderValue: parseFloat(orderStats?.averageOrderValue || 0),
        },
      };
    } catch (error) {
      throw new Error(`Get customer details error: ${error.message}`);
    }
  }

  // Block/Unblock customer
  async toggleCustomerStatus(customerId, action, reason = "") {
    try {
      const customer = await User.findOne({
        where: {
          id: customerId,
          role: "customer",
        },
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      const newStatus = action === "block" ? "blocked" : "active";

      await customer.update({
        status: newStatus,
        status_reason: reason,
        status_updated_at: new Date(),
      });

      // Log the action
      await AdminActionLog.create({
        admin_id: req.admin.id, // You'll need to pass this from controller
        action: `customer_${action}`,
        target_type: "customer",
        target_id: customerId,
        details: { reason },
      });

      return {
        message: `Customer ${action}ed successfully`,
        customer: {
          id: customer.id,
          status: newStatus,
          reason,
        },
      };
    } catch (error) {
      throw new Error(`Toggle customer status error: ${error.message}`);
    }
  }

  // Update customer information
  async updateCustomer(customerId, updateData) {
    try {
      const customer = await User.findOne({
        where: {
          id: customerId,
          role: "customer",
        },
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      // Remove sensitive fields
      const allowedFields = ["name", "phone", "address", "status"];
      const filteredData = Object.keys(updateData)
        .filter((key) => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {});

      await customer.update(filteredData);

      return {
        message: "Customer updated successfully",
        customer: await User.findByPk(customerId, {
          attributes: { exclude: ["password"] },
        }),
      };
    } catch (error) {
      throw new Error(`Update customer error: ${error.message}`);
    }
  }
}

export default new CustomerService();
