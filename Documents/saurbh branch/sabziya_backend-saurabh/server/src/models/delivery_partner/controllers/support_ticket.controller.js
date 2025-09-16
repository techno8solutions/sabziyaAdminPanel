// controllers/supportController.js
import db from "../..//index.js";

const SupportTicket = db.support_tickets;
const Notification = db.Notification;
// Create a new support ticket
// Create a new support ticket with notification
export const createTicket = async (req, res) => {
  try {
    const { partner_id, subject, description } = req.body;
    console.log(req.body);
    
    const ticket = await SupportTicket.create({
      partner_id,
      subject,
      description,
      priority: "medium",
    });

    // Create notification for support team
    await Notification.create({
      delivery_partner_id: partner_id,
      type: "system_alert",
      title: "New Support Ticket Created",
      message: `Your support ticket "${subject}" has been created successfully. We'll get back to you soon.`,
      priority: "medium",
    });

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    console.error("createTicket error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update ticket status with notification
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const { status } = req.body;

    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    await SupportTicket.update({ status }, { where: { id } });

    // Notify partner about status update
    await Notification.create({
      delivery_partner_id: ticket.partner_id,
      type: "system_alert",
      title: "Support Ticket Updated",
      message: `Your support ticket status has been updated to: ${status.replace('_', ' ')}`,
      data: { ticket_id: id, new_status: status },
      priority: "low",
    });

    res.status(200).json({ success: true, message: "Ticket updated" });
  } catch (error) {
    console.error("updateTicketStatus error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Fetch all tickets for a partner
export const getTickets = async (req, res) => {
  try {
    const { partner_id } = req.query;
    const tickets = await SupportTicket.findAll({
      where: { partner_id },
      order: [["created_at", "DESC"]], // 👈 match DB column
    });

    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("getTickets error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

