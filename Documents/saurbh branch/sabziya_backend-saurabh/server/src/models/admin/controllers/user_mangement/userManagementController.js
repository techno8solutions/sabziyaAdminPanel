import userManagementService from "../../../services/admin/userManagementService.js";
import customerService from "../../../services/admin/customerService.js";
import deliveryPartnerService from "../../../services/admin/deliveryPartnerService.js";

class UserManagementController {
  // Get user management dashboard
  async getDashboard(req, res) {
    try {
      const [statistics, growthData] = await Promise.all([
        userManagementService.getUserStatistics(),
        userManagementService.getUserGrowthData(),
      ]);

      return res.status(200).json({
        success: true,
        message: "User management dashboard retrieved successfully",
        data: {
          statistics,
          growthData,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("User management dashboard error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve user management dashboard",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get all customers
  async getCustomers(req, res) {
    try {
      const result = await customerService.getCustomers(req.query);

      return res.status(200).json({
        success: true,
        message: "Customers retrieved successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Get customers error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve customers",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get customer details
  async getCustomerDetails(req, res) {
    try {
      const { customerId } = req.params;
      const result = await customerService.getCustomerDetails(customerId);

      return res.status(200).json({
        success: true,
        message: "Customer details retrieved successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Get customer details error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve customer details",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Block/Unblock customer
  async toggleCustomerStatus(req, res) {
    try {
      const { customerId } = req.params;
      const { action, reason } = req.body;

      if (!["block", "unblock"].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use "block" or "unblock"',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await customerService.toggleCustomerStatus(
        customerId,
        action,
        reason
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.customer,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Toggle customer status error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update customer status",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Update customer
  async updateCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const updateData = req.body;

      const result = await customerService.updateCustomer(
        customerId,
        updateData
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.customer,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Update customer error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update customer",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get all delivery partners
  async getDeliveryPartners(req, res) {
    try {
      const result = await deliveryPartnerService.getDeliveryPartners(
        req.query
      );

      return res.status(200).json({
        success: true,
        message: "Delivery partners retrieved successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Get delivery partners error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve delivery partners",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get delivery partner details
  async getPartnerDetails(req, res) {
    try {
      const { partnerId } = req.params;
      const result = await deliveryPartnerService.getPartnerDetails(partnerId);

      return res.status(200).json({
        success: true,
        message: "Partner details retrieved successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Get partner details error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve partner details",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Approve/Reject delivery partner
  async updatePartnerVerification(req, res) {
    try {
      const { partnerId } = req.params;
      const { status, reason } = req.body;

      if (!["verified", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Use "verified" or "rejected"',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await deliveryPartnerService.updateVerificationStatus(
        partnerId,
        status,
        reason
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.partner,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Update partner verification error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update partner verification",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Suspend/Activate delivery partner
  async togglePartnerStatus(req, res) {
    try {
      const { partnerId } = req.params;
      const { action, reason } = req.body;

      if (!["suspend", "activate"].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use "suspend" or "activate"',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await deliveryPartnerService.togglePartnerStatus(
        partnerId,
        action,
        reason
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.partner,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Toggle partner status error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update partner status",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Assign zone to delivery partner
  async assignZone(req, res) {
    try {
      const { partnerId } = req.params;
      const { zones } = req.body;

      const zoneData = {
        zones,
        assignedBy: req.admin.id, // from auth middleware
      };

      const result = await deliveryPartnerService.assignZone(
        partnerId,
        zoneData
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.partner,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Assign zone error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to assign zone",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get student partners with ID verification
  async getStudentPartners(req, res) {
    try {
      const result = await deliveryPartnerService.getStudentPartners(req.query);

      return res.status(200).json({
        success: true,
        message: "Student partners retrieved successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Get student partners error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve student partners",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Verify student ID
  async verifyStudentId(req, res) {
    try {
      const { partnerId } = req.params;
      const { status, notes } = req.body;

      const verificationData = {
        status,
        notes,
        verifiedBy: req.admin.id,
      };

      const result = await deliveryPartnerService.verifyStudentId(
        partnerId,
        verificationData
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.partner,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Verify student ID error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify student ID",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
        timestamp: new Date().toISOString(),
      });
    }
  }
  
}

export default new UserManagementController();
