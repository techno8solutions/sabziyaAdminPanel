import db from "../../index.js";

const { Cart, Customer, Product } = db;
// server/src/models/order/controllers/cart.controller.js

// Add to cart or update quantity
export const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const customer_id = req.user.id;
    if (!product_id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    let cartItem = await Cart.findOne({
      where: { customer_id, product_id },
      include: [{ model: Product, as: "product" }],
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;

      if (product.stock_quantity < newQuantity) {
        return res
          .status(400)
          .json({ message: "Insufficient stock for the requested quantity" });
      }

      cartItem.quantity = newQuantity;
      cartItem.price = product.price;
      cartItem.total_price = product.price * newQuantity;
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        customer_id,
        product_id,
        quantity,
        price: product.price,
        total_price: product.price * quantity,
      });

      cartItem = await Cart.findByPk(cartItem.id, {
        include: [{ model: Product, as: "product" }],
      });
    }

    res.json({ cartItem, message: "Product added to cart successfully" });
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const customer_id = req.user.id;

    const cartItems = await Cart.findAll({
      where: { customer_id },
      include: [
        {
          model: Product,
          as: "product",
          attributes: [
            "id",
            "p_title",
            "p_description",
            "image_url",
            "stock_quantity",
            "unit",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const subtotal = cartItems.reduce(
      (total, item) => total + parseFloat(item.total_price),
      0
    );
    const totalItems = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    res.json({
      cartItems,
      summary: { subtotal, totalItems },
      message: "Cart retrieved successfully",
    });
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { cart_item_id } = req.params;
    const { quantity } = req.body;
    const customer_id = req.user.id;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Valid quantity is required" });
    }

    const cartItem = await Cart.findOne({
      where: { id: cart_item_id, customer_id },
      include: [{ model: Product, as: "product" }],
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (cartItem.product.stock_quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    cartItem.quantity = quantity;
    cartItem.total_price = cartItem.price * quantity;
    await cartItem.save();

    res.json({ cartItem, message: "Cart item updated successfully" });
  } catch (error) {
    console.error("updateCartItem error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove from cart
export const removeFromCart = async (req, res) => {
  try {
    const { cart_item_id } = req.params;
    const customer_id = req.user.id;

    const cartItem = await Cart.findOne({
      where: { id: cart_item_id, customer_id },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await cartItem.destroy();

    res.json({ message: "Item removed from cart successfully" });
  } catch (error) {
    console.error("removeFromCart error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const customer_id = req.user.id;

    await Cart.destroy({ where: { customer_id } });

    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("clearCart error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update cart quantity (+ or -)
export const updateCartQuantity = async (req, res) => {
  try {
    const { customer_id, product_id, action } = req.body;
    // action = "increment" or "decrement"

    if (!customer_id || !product_id || !action) {
      return res.status(400).json({
        success: false,
        message: "customer_id, product_id and action are required",
      });
    }

    // Check if cart item exists
    let cartItem = await Cart.findOne({
      where: { customer_id, product_id },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    if (action === "increment") {
      cartItem.quantity += 1;
    } else if (action === "decrement") {
      cartItem.quantity -= 1;
      if (cartItem.quantity <= 0) {
        await cartItem.destroy();
        return res.status(200).json({
          success: true,
          message: "Product removed from cart",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use 'increment' or 'decrement'",
      });
    }

    await cartItem.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cartItem,
    });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating cart",
      error: error.message,
    });
  }
};

// Delete a product from cart
export const deleteFromCart = async (req, res) => {
  try {
    const { customer_id, product_id } = req.body;

    if (!customer_id || !product_id) {
      return res.status(400).json({
        success: false,
        message: "customer_id and product_id are required",
      });
    }

    // Find the cart item
    const cartItem = await Cart.findOne({
      where: { customer_id, product_id },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Delete item from cart
    await cartItem.destroy();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
    });
  } catch (error) {
    console.error("Error deleting from cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting from cart",
      error: error.message,
    });
  }
};

// Get all cart items for a customer
export const getCartByCustomer = async (req, res) => {
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
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    // Fetch cart with products
    const cartItems = await Cart.findAll({
      where: { customer_id },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "p_title", "price", "image_url"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      cart: cartItems,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching cart",
      error: error.message,
    });
  }
};

// Delete a particular product from cart
export const deleteProductFromCart = async (req, res) => {
  try {
    const { customer_id, product_id } = req.params;

    if (!customer_id || !product_id) {
      return res.status(400).json({
        success: false,
        message: "customer_id and product_id are required",
      });
    }

    // Check if item exists in cart
    const cartItem = await Cart.findOne({
      where: { customer_id, product_id },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Delete the cart item
    await cartItem.destroy();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
    });
  } catch (error) {
    console.error("Error deleting product from cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting product from cart",
      error: error.message,
    });
  }
};
