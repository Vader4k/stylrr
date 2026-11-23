import express from "express";
import { addToCart, getCart, removeFromCart, resetCart } from "../controllers/cartController.js";
import { protectOptional } from "../middleware/protectOptional.js";
import { attachCartId } from "../middleware/cart-session.js";

const router = express.Router();

// Every cart route needs both the guest cartId cookie and the optional user
router.use(attachCartId, protectOptional);

router.post("/add", addToCart);
router.get("/", getCart);
router.delete("/remove/:itemId", removeFromCart);
router.delete("/reset", resetCart);

export default router;
