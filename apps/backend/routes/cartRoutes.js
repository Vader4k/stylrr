import express from "express";
import { addToCart, getCart, removeFromCart, resetCart } from "../controllers/cartController.js";
import { protectOptional } from "../middleware/protectOptional.js";
import { attachCartId } from "../middleware/cart-session.js";

const router = express.Router();

router.post("/add", attachCartId, protectOptional, addToCart);
router.get("/", protectOptional, getCart);
router.delete("/remove/:itemId", protectOptional, removeFromCart);
router.delete("/reset", protectOptional, resetCart);

export default router;