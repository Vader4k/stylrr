import { Cart } from "../models/cart.model.js";

// Build the lookup filter for the current requester. Never return a filter
// with an undefined value: Mongoose strips undefined keys, which would turn
// findOne({ cartId: undefined }) into findOne({}) and match someone else's cart.
const cartFilter = (req) => {
    if (req.user) return { user: req.user._id }
    if (req.cartId) return { cartId: req.cartId }
    return null
}

const findCart = (req) => {
    const filter = cartFilter(req)
    return filter ? Cart.findOne(filter) : null
}

export const addToCart = async (req, res) => {
    try {
        const { product, sku, quantity, size, color } = req.body;
        let cart = await findCart(req)

        //if no cart
        if (!cart) {
            cart = await Cart.create({
                user: req.user?._id || null,
                cartId: req.user ? null : req.cartId,
                items: []
            })
        }

        // check if item already exits in cart
        const existingItem = cart.items.find(item =>
            item.sku === sku &&
            item.product.toString() === product &&
            item.size === size &&
            (item.color || null) === (color || null)
        )

        if (existingItem) {
            existingItem.quantity += quantity
        } else {
            cart.items.push({
                product,
                sku,
                quantity,
                size,
                color
            })
        }

        await cart.save()

        res.status(200).json({
            success: true,
            message: "Item added to cart",
            cart
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "server error",
            error: error.message
        })
    }
}

export const getCart = async (req, res) => {
    try {
        const filter = cartFilter(req)
        const cart = filter
            ? await Cart.findOne(filter).populate("items.product", "name images price discountPrice slug inventory")
            : null

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Cart is empty",
                cart: null
            })
        }

        const cartObj = cart.toObject();

        cartObj.items = cartObj.items.map(item => {

            //check if items are still available (ie quanitity is enough in store)
            if (item.product && item.product.inventory) {
                const inventoryItem = item.product.inventory.find(i => i.size === item.size);
                const availableQuantity = inventoryItem ? inventoryItem.quantity : 0;

                item.isAvailable = availableQuantity > 0;
                item.availableQuantity = availableQuantity;

                if (item.quantity > availableQuantity) {
                    item.quantity = availableQuantity;
                }
            } else {
                item.isAvailable = false;
                item.availableQuantity = 0;
            }

            if (item.product) {
                const effectivePrice = item.product.discountPrice > 0
                    ? item.product.discountPrice
                    : item.product.price;

                // Update the product object to reflect the effective price
                // We'll keep the original fields but ensure price reflects what the user should pay
                item.product.price = effectivePrice;
            }
            return item;
        });

        res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            cart: cartObj
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "server error",
            error: error.message
        })
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params
        const cart = await findCart(req)

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            })
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId)

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            })
        }

        cart.items.splice(itemIndex, 1)
        await cart.save()

        res.status(200).json({
            success: true,
            message: "Item removed from cart",
            cart
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "server error",
            error: error.message
        })
    }
}

export const resetCart = async (req, res, next) => {
    try {
        const cart = await findCart(req)

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            })
        }

        cart.items = []
        await cart.save()

        res.status(200).json({
            success: true,
            message: "Cart reset successfully",
            cart
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "server error",
            error: error.message
        })
    }
}


