class DeliveryPartnerService {
  // Get all delivery partners with filters
  async getDeliveryPartners(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search = "",
        status = "all",
        verificationStatus = "all",
        vehicleType = "all",
        visaType = "all",
        sortBy = "created_at",
        sortOrder = "DESC",
      } = options;

      const offset = (page - 1) * limit;
      let whereClause = {};

      // Search filter
      if (search) {
        whereClause[Op.or] = [
          { partner_code: { [Op.like]: `%${search}%` } },
          { vehicle_number: { [Op.like]: `%${search}%` } },
          { license_number: { [Op.like]: `%${search}%` } },
        ];
      }

      // Status filter
      if (status !== "all") {
        whereClause.availability_status = status;
      }

      // Verification status filter
      if (verificationStatus !== "all") {
        whereClause.verification_status = verificationStatus;
      }

      // Vehicle type filter
      if (vehicleType !== "all") {
        whereClause.vehicle_type = vehicleType;
      }

      // Visa type filter
      if (visaType === "student") {
        whereClause.student_visa = 1;
      } else if (visaType === "psw") {
        whereClause.psw_visa = 1;
      }

      const { count, rows } = await DeliveryPartner.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder]],
        include: [
          {
            model: User,
            where: { role: "delivery_partner" },
            attributes: ["name", "email", "phone", "status"],
          },
        ],
      });

      return {
        partners: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      };
    } catch (error) {
      throw new Error(`Get delivery partners error: ${error.message}`);
    }
  }

  // Get delivery partner details
  async getPartnerDetails(partnerId) {
    try {
      const partner = await DeliveryPartner.findByPk(partnerId, {
        include: [
          {
            model: User,
            where: { role: "delivery_partner" },
            attributes: { exclude: ["password"] },
          },
          {
            model: OrderAssignment,
            limit: 10,
            order: [["assigned_at", "DESC"]],
            include: [
              {
                model: Order,
                attributes: ["id", "total_amount", "status", "order_date"],
              },
            ],
          },
        ],
      });

      if (!partner) {
        throw new Error("Delivery partner not found");
      }

      return partner;
    } catch (error) {
      throw new Error(`Get partner details error: ${error.message}`);
    }
  }

  // Approve/Reject delivery partner
  async updateVerificationStatus(partnerId, status, reason = "") {
    try {
      const partner = await DeliveryPartner.findByPk(partnerId);

      if (!partner) {
        throw new Error("Delivery partner not found");
      }

      await partner.update({
        verification_status: status,
        verification_reason: reason,
        verification_date: new Date(),
      });

      // If approved, complete onboarding
      if (status === "verified") {
        await partner.update({
          onboarding_completed: true,
        });
      }

      return {
        message: `Partner ${status} successfully`,
        partner: {
          id: partnerId,
          status,
          reason,
        },
      };
    } catch (error) {
      throw new Error(`Update verification status error: ${error.message}`);
    }
  }

  // Suspend/Activate delivery partner
  async togglePartnerStatus(partnerId, action, reason = "") {
    try {
      const partner = await DeliveryPartner.findByPk(partnerId, {
        include: [{ model: User }],
      });

      if (!partner) {
        throw new Error("Delivery partner not found");
      }

      const newStatus = action === "suspend" ? "offline" : "online";
      const userStatus = action === "suspend" ? "suspended" : "active";

      await Promise.all([
        partner.update({
          availability_status: newStatus,
          suspension_reason: reason,
          suspended_at: action === "suspend" ? new Date() : null,
        }),
        partner.User.update({
          status: userStatus,
        }),
      ]);

      return {
        message: `Partner ${action}ed successfully`,
        partner: {
          id: partnerId,
          availabilityStatus: newStatus,
          userStatus,
          reason,
        },
      };
    } catch (error) {
      throw new Error(`Toggle partner status error: ${error.message}`);
    }
  }

  // Assign zone to delivery partner
  async assignZone(partnerId, zoneData) {
    try {
      const partner = await DeliveryPartner.findByPk(partnerId);

      if (!partner) {
        throw new Error("Delivery partner not found");
      }

      // Assuming you have a zones table/field
      await partner.update({
        assigned_zones: JSON.stringify(zoneData.zones),
        zone_assigned_at: new Date(),
        zone_assigned_by: zoneData.assignedBy,
      });

      return {
        message: "Zone assigned successfully",
        partner: {
          id: partnerId,
          zones: zoneData.zones,
        },
      };
    } catch (error) {
      throw new Error(`Assign zone error: ${error.message}`);
    }
  }

  // Get student partners with ID verification
  async getStudentPartners(options = {}) {
    try {
      const { page = 1, limit = 20, idVerified = "all" } = options;

      const offset = (page - 1) * limit;
      let whereClause = {
        student_visa: 1,
      };

      // ID verification filter
      if (idVerified === "verified") {
        whereClause.id_verification_status = "verified";
      } else if (idVerified === "pending") {
        whereClause.id_verification_status = "pending";
      }

      const { count, rows } = await DeliveryPartner.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["created_at", "DESC"]],
        include: [
          {
            model: User,
            attributes: ["name", "email", "phone"],
          },
        ],
      });

      return {
        studentPartners: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      };
    } catch (error) {
      throw new Error(`Get student partners error: ${error.message}`);
    }
  }

  // Verify student ID
  async verifyStudentId(partnerId, verificationData) {
    try {
      const partner = await DeliveryPartner.findByPk(partnerId);

      if (!partner) {
        throw new Error("Delivery partner not found");
      }

      await partner.update({
        id_verification_status: verificationData.status,
        id_verification_notes: verificationData.notes,
        id_verified_at: new Date(),
        id_verified_by: verificationData.verifiedBy,
      });

      return {
        message: "Student ID verification updated successfully",
        partner: {
          id: partnerId,
          verificationStatus: verificationData.status,
        },
      };
    } catch (error) {
      throw new Error(`Verify student ID error: ${error.message}`);
    }
  }
}

export default new DeliveryPartnerService();
