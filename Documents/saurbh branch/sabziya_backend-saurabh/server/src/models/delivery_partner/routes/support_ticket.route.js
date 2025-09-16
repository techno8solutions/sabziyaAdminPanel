// routes/supportRoutes.js
import express from "express";
import {
  createTicket,
  getTickets,
  updateTicketStatus,
} from "../controllers/support_ticket.controller.js";

const supportTicketRouter = express.Router();

// Delivery partner creates ticket
supportTicketRouter.post("/create-support-ticket", createTicket);

// Delivery partner fetches their tickets
supportTicketRouter.get("/get-ticekt", getTickets);

// Admin/Support updates ticket status
supportTicketRouter.put("/ticket-status", updateTicketStatus);

export default supportTicketRouter;
