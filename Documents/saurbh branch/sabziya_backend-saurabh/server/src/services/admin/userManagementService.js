import db from "../../models/index.js";
import { Op, fn, col, literal } from "sequelize";

const { User, DeliveryPartner, Customer, Admin } = db; // Adjust based on your models

class UserManagementService {
  // Get user statistics overview
  async getUserStatistics() {
    try {
      const stats = await Promise.all([
        // Total customers
        User.count({ where: { role: "customer" } }),

        // Active customers (recent activity)
        User.count({
          where: {
            role: "customer",
            last_login: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),

        // Total delivery partners
        DeliveryPartner.count(),

        // Verified delivery partners
        DeliveryPartner.count({
          where: { verification_status: "verified" },
        }),

        // Pending verification
        DeliveryPartner.count({
          where: { verification_status: "pending" },
        }),

        // Online delivery partners
        DeliveryPartner.count({
          where: { availability_status: "online" },
        }),

        // Student visa partners
        DeliveryPartner.count({
          where: { student_visa: 1 },
        }),

        // Total admins
        User.count({ where: { role: "admin" } }),
      ]);

      return {
        customers: {
          total: stats[0],
          active: stats[1],
          inactive: stats[0] - stats[1],
        },
        deliveryPartners: {
          total: stats[2],
          verified: stats[3],
          pending: stats[4],
          online: stats[5],
          studentVisa: stats[6],
        },
        admins: {
          total: stats[7],
        },
      };
    } catch (error) {
      throw new Error(`User statistics error: ${error.message}`);
    }
  }

  // Get user growth data (monthly)
  async getUserGrowthData() {
    try {
      const currentYear = new Date().getFullYear();

      const [customerGrowth, partnerGrowth] = await Promise.all([
        User.findAll({
          attributes: [
            [fn("MONTH", col("created_at")), "month"],
            [fn("COUNT", col("id")), "count"],
          ],
          where: {
            role: "customer",
            created_at: {
              [Op.gte]: new Date(`${currentYear}-01-01`),
            },
          },
          group: [fn("MONTH", col("created_at"))],
          order: [[fn("MONTH", col("created_at")), "ASC"]],
          raw: true,
        }),

        DeliveryPartner.findAll({
          attributes: [
            [fn("MONTH", col("created_at")), "month"],
            [fn("COUNT", col("id")), "count"],
          ],
          where: {
            created_at: {
              [Op.gte]: new Date(`${currentYear}-01-01`),
            },
          },
          group: [fn("MONTH", col("created_at"))],
          order: [[fn("MONTH", col("created_at")), "ASC"]],
          raw: true,
        }),
      ]);

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

      return {
        customers: customerGrowth.map((item) => ({
          month: monthNames[item.month - 1],
          count: parseInt(item.count),
        })),
        deliveryPartners: partnerGrowth.map((item) => ({
          month: monthNames[item.month - 1],
          count: parseInt(item.count),
        })),
      };
    } catch (error) {
      throw new Error(`User growth data error: ${error.message}`);
    }
  }
}

export default new UserManagementService();
