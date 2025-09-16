import db from '../../index.js';

const { CustomerSupportTicket, Customer, Orders } = db;

export const createSupportTicket = async (req, res) => {
  try {
    const { customer_id } = req.params; // ✅ from params
    const { order_id, subject, description, priority } = req.body;

    // Validate required fields
    if (!subject || !description) {
      return res.status(400).json({
        message: "subject and description are required",
      });
    }

    // Check if customer exists
    const customer = await Customer.findByPk(customer_id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // (Optional) Check if order exists when provided
    if (order_id) {
      const order = await Orders.findByPk(order_id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
    }

    // Create ticket
    const ticket = await CustomerSupportTicket.create({
      customer_id,
      order_id: order_id || null,
      subject,
      description,
      priority: priority || "medium",
    });

    return res.status(201).json({
      message: "Support ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all support tickets (ticket details only)
export const getAllSupportTickets = async (req, res) => {
  try {
    const tickets = await CustomerSupportTicket.findAll({
      attributes: [
        "id", // Ticket No.
        "order_id",
        "subject",
        "description",
        "priority",
        "status",
        "created_at", // ✅ matches DB column
      ],
      order: [["created_at", "DESC"]], // ✅ FIXED
    });

    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch tickets" });
  }
};

// Fetch single ticket by ID
export const getSupportTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await CustomerSupportTicket.findByPk(ticketId, {
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "name", "email", "phone_number"], 
        },
        {
          model: Orders,
          as: "order",
          attributes: ["id", "total_amount", "status", "created_at"], 
        },
      ],
    });

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error fetching ticket details:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch ticket details" });
  }
};