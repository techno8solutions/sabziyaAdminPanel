import Stripe from "stripe";
import db from "../../index.js";

const { Orders, OrderItems, Product, Cart, DeliveryAddress, Payment } = db;

// Dummy Stripe secret key (replace with real key in production)
const stripe = new Stripe("sk_test_dummyKeyHere");

export const makePayment = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const { customer_id } = req.params;
    const { address_id, payment_method, delivery_instructions } = req.body;

    if (!customer_id || !address_id || !payment_method) {
      return res.status(400).json({
        success: false,
        message: "customer_id, address_id, and payment_method are required",
      });
    }

    // 🔹 Fetch delivery address
    const deliveryAddress = await DeliveryAddress.findOne({
      where: { id: address_id, customer_id },
    });
    if (!deliveryAddress) {
      return res.status(404).json({
        success: false,
        message: "Delivery address not found",
      });
    }

    // 🔹 Fetch cart items
    const cartItems = await Cart.findAll({
      where: { customer_id },
      include: [{ model: Product, as: "product" }],
      transaction: t,
    });

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Please add products before checkout.",
      });
    }

    // 🔹 Calculate total amount
    let subtotal = 0;
    for (const item of cartItems) {
      if (!item.product)
        throw new Error(`Product with ID ${item.product_id} not found`);
      if (item.product.stock_quantity < item.quantity)
        throw new Error(
          `Insufficient stock for product ${item.product.p_title}`
        );
      subtotal += item.product.price * item.quantity;
    }
    const tax_amount = subtotal * 0.05;
    const delivery_fee = 50;
    const discount_amount = 0;
    const total_amount = subtotal + tax_amount + delivery_fee - discount_amount;

    // 🔹 Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total_amount * 100), // Stripe expects cents
      currency: "gbp",
      payment_method_types: [payment_method], // e.g., 'card'
      metadata: { customer_id },
    });

    // 🔹 Simulate payment confirmation (dummy)
    const paymentStatus = "success"; // or "failed" in simulation
    const payment = await Payment.create(
      {
        payment_gateway: "stripe",
        transaction_id: paymentIntent.id,
        amount: total_amount,
        status: paymentStatus,
        paid_at: new Date(),
      },
      { transaction: t }
    );

    // 🔹 Only create order if payment succeeded
    if (paymentStatus === "success") {
      const order = await Orders.create(
        {
          customer_id,
          delivery_address_id: address_id,
          delivery_instructions,
          payment_method,
          payment_status: "paid",
          payment_id: payment.id,
          status: "pending",
          total_amount,
          tax_amount,
          delivery_fee,
          discount_amount,
        },
        { transaction: t }
      );

      // 🔹 Create order items & reduce stock
      for (const item of cartItems) {
        const product = item.product;
        product.stock_quantity -= item.quantity;
        await product.save({ transaction: t });

        await OrderItems.create(
          {
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: product.price,
            total_price: product.price * item.quantity,
          },
          { transaction: t }
        );
      }

      // 🔹 Clear cart
      await Cart.destroy({ where: { customer_id }, transaction: t });

      await t.commit();

      return res.status(201).json({
        success: true,
        message: "Payment successful and order placed",
        data: { order, payment },
      });
    } else {
      await t.commit(); // still commit to save payment record
      return res.status(400).json({
        success: false,
        message: "Payment failed. Order not created",
        data: { payment },
      });
    }
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during payment",
      error: error.message,
    });
  }
};
