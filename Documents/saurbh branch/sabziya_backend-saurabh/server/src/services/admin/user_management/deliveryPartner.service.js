import db from "../../../models/index.js";

const { delivery_partners_registration } = db;

class DeliveryPartnerService {
  /** Onboard a new partner */
  static async onboardPartner(data) {
    return delivery_partners_registration.create(data);
  }

  /** Approve a partner (ID verified etc.) */
  static async approvePartner(id) {
    const partner = await delivery_partners_registration.findByPk(id);
    if (!partner) throw new Error("Partner not found");

    partner.verification_status = "verified";
    partner.onboarding_completed = true;
    await partner.save();
    return partner;
  }

  /** Suspend a partner */
  static async suspendPartner(id) {
    const partner = await delivery_partners_registration.findByPk(id);
    if (!partner) throw new Error("Partner not found");

    partner.verification_status = "rejected";
    partner.availability_status = "offline";
    await partner.save();
    return partner;
  }

  /** Assign partner to zone */
  static async assignZone(id, zone) {
    const partner = await delivery_partners_registration.findByPk(id);
    if (!partner) throw new Error("Partner not found");

    partner.zone = zone; // Add `zone` column in model if not exists
    await partner.save();
    return partner;
  }

  /** Student filter - ID verification */
  static async filterStudentPartners() {
    return delivery_partners_registration.findAll({
      where: { student_visa: 1 },
    });
  }
}

export default DeliveryPartnerService;
