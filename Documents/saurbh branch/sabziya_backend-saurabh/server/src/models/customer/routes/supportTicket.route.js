import express from 'express';
import {
  createSupportTicket,
  getAllSupportTickets,
  getSupportTicketById,
} from "../controllers/supportTicket.controller.js";

const router = express.Router();

router.post('/:customer_id/support', createSupportTicket);

// GET /api/v1/support/tickets → fetch all tickets
router.get("/tickets", getAllSupportTickets);

// GET /api/v1/support/tickets/:ticketId → fetch single ticket details
router.get("/tickets/:ticketId", getSupportTicketById);

export default router;