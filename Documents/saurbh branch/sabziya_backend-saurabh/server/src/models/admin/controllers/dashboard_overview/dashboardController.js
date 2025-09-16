import dashboardService from "../../../../services/admin/dashboardService.js";

class DashboardController {
  // Get complete dashboard overview
  async getOverview(req, res) {
    try {
      const overview = await dashboardService.getDashboardOverview();

      return res.status(200).json({
        success: true,
        message: "Dashboard overview retrieved successfully",
        data: overview,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Dashboard overview error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve dashboard overview",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get all chart data for dashboard
  async getChartsData(req, res) {
    try {
      const [salesChart, earningsChart, partnersChart] = await Promise.all([
        dashboardService.getSalesChartData(),
        dashboardService.getEarningsChartData(),
        dashboardService.getDeliveryPartnersChartData(),
      ]);

      const chartData = {
        sales: salesChart,
        earnings: earningsChart,
        deliveryPartners: partnersChart,
      };

      return res.status(200).json({
        success: true,
        message: "Chart data retrieved successfully",
        data: chartData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Chart data error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve chart data",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get recent orders
  async getRecentOrders(req, res) {
    try {
      const { limit = 10 } = req.query;
      const recentOrders = await dashboardService.getRecentOrders(
        parseInt(limit)
      );

      return res.status(200).json({
        success: true,
        message: "Recent orders retrieved successfully",
        data: recentOrders,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Recent orders error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve recent orders",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get order status distribution
  async getOrderStatusDistribution(req, res) {
    try {
      const statusDistribution =
        await dashboardService.getOrderStatusDistribution();

      // Calculate percentages
      const totalOrders = statusDistribution.reduce(
        (sum, item) => sum + item.count,
        0
      );
      const distributionWithPercentages = statusDistribution.map((item) => ({
        ...item,
        percentage: parseFloat(((item.count / totalOrders) * 100).toFixed(2)),
      }));

      return res.status(200).json({
        success: true,
        message: "Order status distribution retrieved successfully",
        data: {
          distribution: distributionWithPercentages,
          totalOrders,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Order status distribution error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve order status distribution",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get complete dashboard data in one call
  async getDashboardData(req, res) {
    try {
      const [
        overview,
        salesChart,
        earningsChart,
        partnersChart,
        recentOrders,
        statusDistribution,
      ] = await Promise.all([
        dashboardService.getDashboardOverview(),
        dashboardService.getSalesChartData(),
        dashboardService.getEarningsChartData(),
        dashboardService.getDeliveryPartnersChartData(),
        dashboardService.getRecentOrders(5),
        dashboardService.getOrderStatusDistribution(),
      ]);

      // Calculate percentages for status distribution
      const totalOrders = statusDistribution.reduce(
        (sum, item) => sum + item.count,
        0
      );
      const distributionWithPercentages = statusDistribution.map((item) => ({
        ...item,
        percentage: parseFloat(((item.count / totalOrders) * 100).toFixed(2)),
      }));

      const dashboardData = {
        overview,
        charts: {
          sales: salesChart,
          earnings: earningsChart,
          deliveryPartners: partnersChart,
        },
        recentOrders,
        orderStatusDistribution: {
          distribution: distributionWithPercentages,
          totalOrders,
        },
      };

      return res.status(200).json({
        success: true,
        message: "Complete dashboard data retrieved successfully",
        data: dashboardData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Complete dashboard data error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve dashboard data",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get real-time delivery tracking
  async getDeliveryTracking(req, res) {
    try {
      const { status } = req.query;

      let whereClause = {};
      if (status) {
        whereClause.status = status;
      }

      const trackingData = await dashboardService.getDeliveryTracking(
        whereClause
      );

      return res.status(200).json({
        success: true,
        message: "Delivery tracking data retrieved successfully",
        data: trackingData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Delivery tracking error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve delivery tracking data",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export default new DashboardController();
