import db from "../../index.js";
const { sequelize, Orders, OrderItems, Product, Cart, DeliveryAddress, Customer } = db;

export const createOrderFromCart = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { customer_id } = req.params;
    const { address_id, payment_method, delivery_instructions } = req.body;

    if (!customer_id) {
      return res
        .status(400)
        .json({ success: false, message: "customer_id is required" });
    }

    // 🔹 Step 0: Fetch delivery address
    const deliveryAddress = await DeliveryAddress.findOne({
      where: { id: address_id, customer_id },
    });
    if (!deliveryAddress) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery address not found" });
    }

    // 🔹 Step 1: Fetch all cart items for this customer
    const cartItems = await Cart.findAll({
      where: { customer_id },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "p_title", "price", "stock_quantity"],
        },
      ],
      transaction: t,
    });

    if (!cartItems || cartItems.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Cart is empty. Please add products before checkout.",
        });
    }

    // 🔹 Step 2: Validate stock & calculate subtotal
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

    // 🔹 Step 3: Add tax, delivery, discounts
    const tax_amount = subtotal * 0.05;
    const delivery_fee = 50;
    const discount_amount = 0;
    const total_amount = subtotal + tax_amount + delivery_fee - discount_amount;

    // 🔹 Step 4: Create the order using delivery address
    const order = await Orders.create(
      {
        customer_id,
        delivery_address_id: address_id,
        delivery_instructions,
        payment_method,
        status: "paid", // prepaid
        total_amount,
        tax_amount,
        delivery_fee,
        discount_amount,
      },
      { transaction: t }
    );

    // 🔹 Step 5: Create order items & update stock
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

    // 🔹 Step 6: Clear cart
    await Cart.destroy({ where: { customer_id }, transaction: t });

    await t.commit();

    const fullOrder = await Orders.findByPk(order.id, {
      include: [
        {
          model: OrderItems,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    return res
      .status(201)
      .json({
        success: true,
        message: "Order placed successfully",
        data: fullOrder,
      });
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error("Create Order Error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Server error while placing order",
        error: error.message,
      });
  }
};

// Fetch all orders with complete details
export const getAllOrders = async (req, res) => {
  try {
    const { customer_id } = req.params; // optional: fetch orders for a specific customer

    const whereCondition = customer_id ? { customer_id } : {};

    const orders = await Orders.findAll({
      where: whereCondition,
      include: [
        {
          model: OrderItems,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "p_title", "price", "stock_quantity"],
            },
          ],
        },
        {
          model: DeliveryAddress,
          as: "deliveryAddress",
          attributes: [
            "id",
            "address_line1",
            "address_line2",
            "city",
            "postal_code",
            "country",
          ],
        },
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "name", "phone_number", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
      error: error.message,
    });
  }
};

// Fetch the Order Details of Particular Order
export const getOrderDetails = async (req, res) => {
  try {
    const { order_id } = req.params;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: "order_id is required",
      });
    }

    const order = await Orders.findByPk(order_id, {
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "name", "email", "phone_number"],
        },
        {
          model: DeliveryAddress,
          as: "deliveryAddress",
          attributes: [
            "id",
            "address_line1",
            "address_line2",
            "city",
            "postal_code",
            "country",
          ],
        },
        {
          model: OrderItems,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "p_title", "price", "stock_quantity"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order details fetched successfully",
      data: order,
    });
  } catch (error) {
    console.error("Get Order Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching order details",
      error: error.message,
    });
  }
};