import db from "../../index.js";
const { DeliveryAddress, Customer } = db;

export const addDeliveryAddress = async (req, res) => {
  try {
    const { customer_id } = req.params; // from URL
    const {
      address_line1,
      address_line2,
      city,
      postal_code,
      country,
      is_default,
    } = req.body;

    // Validate required fields
    if (!address_line1 || !postal_code) {
      return res.status(400).json({
        success: false,
        message: "address_line1 and postal_code are required",
      });
    }

    // Check if customer exists
    const customer = await Customer.findByPk(customer_id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Reset default if needed
    if (is_default) {
      await DeliveryAddress.update(
        { is_default: false },
        { where: { customer_id } }
      );
    }

    // Create new address
    const newAddress = await DeliveryAddress.create({
      customer_id,
      address_line1,
      address_line2,
      city: city || "London",
      postal_code,
      country: country || "United Kingdom",
      is_default: is_default || false,
    });

    return res.status(201).json({
      success: true,
      message: "Delivery address added successfully",
      data: newAddress,
    });
  } catch (error) {
    console.error("Add Address Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding address",
      error: error.message,
    });
  }
};


// Delete a specific delivery address for a customer
export const deleteDeliveryAddress = async (req, res) => {
  try {
    const { customer_id, address_id } = req.params;

    if (!customer_id || !address_id) {
      return res.status(400).json({
        success: false,
        message: "customer_id and address_id are required",
      });
    }

    // Check if customer exists
    const customer = await Customer.findByPk(customer_id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check if the address exists for this customer
    const address = await DeliveryAddress.findOne({
      where: { id: address_id, customer_id },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Delivery address not found for this customer",
      });
    }

    // Delete the address
    await address.destroy();

    return res.status(200).json({
      success: true,
      message: "Delivery address deleted successfully",
    });
  } catch (error) {
    console.error("Delete Delivery Address Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting delivery address",
      error: error.message,
    });
  }
};

// Update Delivery Address
export const updateDeliveryAddress = async (req, res) => {
  try {
    const { customer_id, address_id } = req.params;
    const {
      address_line1,
      address_line2,
      city,
      postal_code,
      country,
      is_default,
    } = req.body;

    if (
      !address_line1 &&
      !address_line2 &&
      !city &&
      !postal_code &&
      !country &&
      is_default === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    // Check if customer exists
    const customer = await Customer.findByPk(customer_id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check if address exists
    const address = await DeliveryAddress.findOne({
      where: { id: address_id, customer_id },
    });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Delivery address not found",
      });
    }

    // If is_default is true, reset other default addresses
    if (is_default) {
      await DeliveryAddress.update(
        { is_default: false },
        { where: { customer_id } }
      );
    }

    // Update the address
    await address.update({
      address_line1: address_line1 || address.address_line1,
      address_line2: address_line2 || address.address_line2,
      city: city || address.city,
      postal_code: postal_code || address.postal_code,
      country: country || address.country,
      is_default: is_default !== undefined ? is_default : address.is_default,
    });

    return res.status(200).json({
      success: true,
      message: "Delivery address updated successfully",
      data: address,
    });
  } catch (error) {
    console.error("Update Delivery Address Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating delivery address",
      error: error.message,
    });
  }
};

// Get all delivery addresses for a customer
export const getCustomerAddresses = async (req, res) => {
  try {
    const { customer_id } = req.params;

    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: "customer_id is required",
      });
    }

    // Check if customer exists
    const customer = await Customer.findByPk(customer_id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Fetch all addresses
    const addresses = await DeliveryAddress.findAll({
      where: { customer_id },
      order: [["is_default", "DESC"], ["id", "ASC"]], // default first
    });

    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      data: addresses,
    });
  } catch (error) {
    console.error("Fetch Addresses Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching addresses",
      error: error.message,
    });
  }
};