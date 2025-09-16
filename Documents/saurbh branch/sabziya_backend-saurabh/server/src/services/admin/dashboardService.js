import { Op } from "sequelize";
import db from "../../models/index.js";
import logger from "../../config/logger.js";

const { Orders, OrderItem, Customer, Product, OrderAssignment } = db;

class DashboardService {
  async getDashboardOverview() {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    try {
      const [
        totalOrders,
        todayOrders,
        monthlyOrders,
        totalRevenue,
        todayRevenue,
        monthlyRevenue,
        activeCustomers,
      ] = await Promise.all([
        Orders.count(),
        Orders.count({
          where: {
            created_at: { [Op.gte]: startOfDay },
          },
        }),
        Orders.count({
          where: {
            created_at: { [Op.gte]: startOfMonth },
          },
        }),
        Orders.sum("total_amount") || 0,
        Orders.sum("total_amount", {
          where: { created_at: { [Op.gte]: startOfDay } },
        }) || 0,
        Orders.sum("total_amount", {
          where: { created_at: { [Op.gte]: startOfMonth } },
        }) || 0,
        Customer
          ? Customer.count({
              where: {
                ...(Customer.rawAttributes.status ? { status: "active" } : {}),
              },
            }).catch(() => Customer.count())
          : 0,
      ]);

      console.log("Dashboard Overview Data:", {
        totalOrders,
        todayOrders,
        monthlyOrders,
        totalRevenue,
        todayRevenue,
        monthlyRevenue,
        activeCustomers,
      });

      return {
        orders: {
          total: totalOrders || 0,
          today: todayOrders || 0,
          monthly: monthlyOrders || 0,
        },
        revenue: {
          total: parseFloat(totalRevenue) || 0,
          today: parseFloat(todayRevenue) || 0,
          monthly: parseFloat(monthlyRevenue) || 0,
        },
        customers: {
          active: activeCustomers || 0,
        },
      };
    } catch (error) {
      console.error("Dashboard overview service error:", error);
      throw new Error(`Dashboard overview failed: ${error.message}`);
    }
  }

  async getSalesChartData() {
    try {
      const last30Days = await Orders.findAll({
        attributes: [
          [db.sequelize.fn("DATE", db.sequelize.col("created_at")), "date"],
          [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
          [db.sequelize.fn("SUM", db.sequelize.col("total_amount")), "total"],
        ],
        where: {
          created_at: {
            [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        group: [db.sequelize.fn("DATE", db.sequelize.col("created_at"))],
        order: [
          [db.sequelize.fn("DATE", db.sequelize.col("created_at")), "ASC"],
        ],
        raw: true,
      });

      return last30Days.map((item) => ({
        date: item.date,
        count: parseInt(item.count) || 0,
        total: parseFloat(item.total) || 0,
      }));
    } catch (error) {
      console.error("Sales chart service error:", error);
      throw new Error(`Sales chart data failed: ${error.message}`);
    }
  }

  async getEarningsChartData() {
    try {
      const monthlyEarnings = await Orders.findAll({
        attributes: [
          [db.sequelize.fn("MONTH", db.sequelize.col("created_at")), "month"],
          [db.sequelize.fn("YEAR", db.sequelize.col("created_at")), "year"],
          [
            db.sequelize.fn("SUM", db.sequelize.col("total_amount")),
            "earnings",
          ],
          [db.sequelize.fn("COUNT", db.sequelize.col("id")), "orderCount"],
        ],
        where: {
          created_at: {
            [Op.gte]: new Date(new Date().getFullYear(), 0, 1),
          },
          payment_status: "paid",
        },
        group: [
          db.sequelize.fn("MONTH", db.sequelize.col("created_at")),
          db.sequelize.fn("YEAR", db.sequelize.col("created_at")),
        ],
        order: [
          [db.sequelize.fn("YEAR", db.sequelize.col("created_at")), "ASC"],
          [db.sequelize.fn("MONTH", db.sequelize.col("created_at")), "ASC"],
        ],
        raw: true,
      });

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      return monthlyEarnings.map((item) => ({
        month: monthNames[item.month - 1],
        year: item.year,
        earnings: parseFloat(item.earnings) || 0,
        orderCount: parseInt(item.orderCount) || 0,
      }));
    } catch (error) {
      console.error("Earnings chart service error:", error);
      throw new Error(`Earnings chart data failed: ${error.message}`);
    }
  }

  async getDeliveryPartnersChartData() {
    try {
      if (!OrderAssignment) {
        console.warn("OrderAssignment model not available");
        return [];
      }

      const last30Days = await OrderAssignment.findAll({
        attributes: [
          [db.sequelize.fn("DATE", db.sequelize.col("created_at")), "date"],
          [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
          "status",
        ],
        where: {
          created_at: {
            [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        group: [
          db.sequelize.fn("DATE", db.sequelize.col("created_at")),
          "status",
        ],
        order: [
          [db.sequelize.fn("DATE", db.sequelize.col("created_at")), "ASC"],
        ],
        raw: true,
      });

      return last30Days.map((item) => ({
        date: item.date,
        count: parseInt(item.count) || 0,
        status: item.status,
      }));
    } catch (error) {
      console.error("Delivery partners chart service error:", error);
      throw new Error(`Delivery partners chart failed: ${error.message}`);
    }
  }

  async getRecentOrders(limit = 10) {
    try {
      const orders = await Orders.findAll({
        include: [
          {
            model: Customer,
            as: "customer",
            attributes: ["id", "name", "phone_number", "email"],
            required: false,
          },
          {
            model: OrderItem,
            as: "items",
            attributes: [
              "id",
              "order_id",
              "product_id",
              "quantity",
              "unit_price",
              "total_price",
            ],
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["id", "p_title"],
                required: false,
              },
            ],
            required: false,
          },
        ],
        order: [["created_at", "DESC"]],
        limit,
      });

      return orders.map((order) => ({
        id: order.id,
        orderDate: order.order_date,
        status: order.status,
        totalAmount: parseFloat(order.total_amount) || 0,
        paymentStatus: order.payment_status,
        deliveryAddress: order.delivery_address,
        customer: order.customer
          ? {
              id: order.customer.id,
              name: order.customer.name,
              phone: order.customer.phone_number,
              email: order.customer.email,
            }
          : null,
        items: order.items
          ? order.items.map((item) => ({
              id: item.id,
              quantity: item.quantity,
              price: parseFloat(item.unit_price) || 0,
              totalPrice: parseFloat(item.total_price) || 0,
              product: item.product
                ? {
                    id: item.product.id,
                    name: item.product.p_title,
                  }
                : null,
            }))
          : [],
      }));
    } catch (error) {
      console.error("Recent orders service error:", error);
      throw new Error(`Recent orders failed: ${error.message}`);
    }
  }

  async getOrderStatusDistribution() {
    try {
      const distribution = await Orders.findAll({
        attributes: [
          "status",
          [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
        ],
        group: ["status"],
        raw: true,
      });

      const totalOrders = distribution.reduce(
        (sum, item) => sum + parseInt(item.count),
        0
      );

      return distribution.map((item) => ({
        status: item.status,
        count: parseInt(item.count) || 0,
        percentage:
          totalOrders > 0
            ? parseFloat(
                ((parseInt(item.count) / totalOrders) * 100).toFixed(2)
              )
            : 0,
      }));
    } catch (error) {
      console.error("Order status distribution service error:", error);
      throw new Error(`Order status distribution failed: ${error.message}`);
    }
  }

  async getDeliveryTracking(whereClause = {}) {
    try {
      if (!OrderAssignment) {
        console.warn("OrderAssignment model not available");
        return [];
      }

      const trackingData = await OrderAssignment.findAll({
        where: whereClause,
        include: [
          {
            model: Orders,
            as: "order",
            attributes: [
              "id",
              "total_amount",
              "delivery_address",
              "order_date",
            ],
            required: false,
          },
        ],
        order: [["assigned_at", "DESC"]],
        limit: 50,
      });

      return trackingData;
    } catch (error) {
      logger.error("Delivery tracking service error:", error);
      throw new Error(`Delivery tracking failed: ${error.message}`);
    }
  }
}

export default new DashboardService();