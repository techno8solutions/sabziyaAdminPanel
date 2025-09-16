import DeliveryPartnerService from "../../../../services/admin/user_management/deliveryPartner.service.js";
import ApiResponse from "../../../../utils/ApiResponse.js";
import AsyncHandler from "../../../../utils/AsyncHandler.js";

class DeliveryPartnerController {
  onboardPartner = AsyncHandler(async (req, res) => {
    const partner = await DeliveryPartnerService.onboardPartner(req.body);
    res.json(new ApiResponse(201, partner, "Partner onboarded successfully"));
  });

  approvePartner = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const partner = await DeliveryPartnerService.approvePartner(id);
    res.json(new ApiResponse(200, partner, "Partner approved"));
  });

  suspendPartner = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const partner = await DeliveryPartnerService.suspendPartner(id);
    res.json(new ApiResponse(200, partner, "Partner suspended"));
  });

  assignZone = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { zone } = req.body;
    const partner = await DeliveryPartnerService.assignZone(id, zone);
    res.json(new ApiResponse(200, partner, "Zone assigned successfully"));
  });

  filterStudentPartners = AsyncHandler(async (req, res) => {
    const partners = await DeliveryPartnerService.filterStudentPartners();
    res.json(new ApiResponse(200, partners, "Student partners fetched"));
  });
}

export default new DeliveryPartnerController();
