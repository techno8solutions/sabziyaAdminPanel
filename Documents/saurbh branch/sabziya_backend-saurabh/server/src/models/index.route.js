import express from "express";
import authRoutes from "./admin/routes/admin.routes.js";
import productRoutes from "./product/routes/product.route.js";
import adminRoutes from "./admin/routes/index.routes.js";
import CategoryRoutes from "./category/routes/category.routes.js";
import CustomerRoutes from "./customer/routes/customer.routes.js"
import deliveryPartnerRouter from "./delivery_partner/routes/deliveryPartners.js";
import orderRoutes from "./order/routes/order.route.js";
import cartRoutes from "./order/routes/cart.route.js";
import deliveryAddressRoutes from './order/routes/deliveryAddress.route.js';
import paymentRoutes from './payment/routes/payment.route.js'
import customerSupportTicketRoutes from './customer/routes/supportTicket.route.js';
import supportTicketRouter from "./delivery_partner/routes/support_ticket.route.js";
const router = express.Router();


//************************************ ADMIN ROUTES ***************************************//
router.use("/v1/admin-routes", authRoutes);
router.use("/v1/admin", adminRoutes);


//************************************ PRODUCT ROUTES **************************************//
router.use("/v1/products", productRoutes);

//***************************************CATEGORY ROUTES************************************ *//
router.use("/v1/products/category", CategoryRoutes);

//****************************************Coustmer Registration************************** *//
router.use("/v1/customers", CustomerRoutes);

router.use("/v1/delivery-partners", deliveryPartnerRouter);

//ORDER ROUTES
router.use('/v1/orders', orderRoutes);

//Cart Routes
router.use('/v1/cart',cartRoutes);

//Delivery Address Routes 
router.use('/v1/deliveryAddress', deliveryAddressRoutes);

//order with payements
router.use('/v1/payments', paymentRoutes)

// Customer Support Ticket Routes
router.use("/v1/customers", customerSupportTicketRoutes);
router.use("/v1/delivery-partners", supportTicketRouter);


export default router;
