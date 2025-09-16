import express from 'express';

import {
  addToCart,
  updateCartQuantity,
  deleteFromCart,
  getCartByCustomer,
  deleteProductFromCart,
  updateCartItem,
  removeFromCart,
  getCart,
  clearCart,
} from "../controllers/cart.controller.js";
import authenticateToken from '../../../middlewares/customer.auth.middleware.js';


const router = express.Router();

//Add product to Cart
router.post("/add-to-cart", authenticateToken, addToCart);

router.use(authenticateToken);

router.post('/add', addToCart);
router.get('/', getCart);
router.put('/:cart_item_id', updateCartItem);
router.delete('/:cart_item_id', removeFromCart);
router.delete('/', clearCart);
//update cart Quantity
// router.put('/update-quantity', updateCartQuantity);

// Delete the product from the cart
router.delete('/delete-from-cart', deleteFromCart);

// Get cart for a particular customer
router.get("/:customer_id", getCartByCustomer);

// DELETE a product from customer's cart
router.delete("/customer/:customer_id/product/:product_id", deleteProductFromCart);


export default router;
