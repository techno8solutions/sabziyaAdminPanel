import UserService from "../../../../services/admin/user_management/customer.service.js";
import ApiResponse from "../../../../utils/ApiResponse.js";
import AsyncHandler from "../../../../utils/AsyncHandler.js";

class UserController {
  getCustomers = AsyncHandler(async (req, res) => {
    const filters = req.query;
    const customers = await UserService.getCustomers(filters);
    res.json(new ApiResponse(200, customers, "Customers fetched successfully"));
  });

  updateCustomer = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const updated = await UserService.updateCustomer(id, req.body);
    res.json(new ApiResponse(200, updated, "Customer updated"));
  });

  toggleCustomerStatus = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // "block" or "unblock"
    const updated = await UserService.toggleCustomerStatus(id, action);
    res.json(new ApiResponse(200, updated, "Customer status updated"));
  });

  assignRole = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const updated = await UserService.assignRole(id, role);
    res.json(new ApiResponse(200, updated, "Role assigned successfully"));
  });
}

export default new UserController();
