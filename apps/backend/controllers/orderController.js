import { Order } from "../models/order.schema.js";
import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";
import { initializeTransaction, verifySignature, verifyTransaction } from "../utils/paystack.js";
import { sendEmail } from "../utils/mail.js";
import { orderConfirmationEmail } from "../emails/orderConfirmation.js";
import { PRODUCTS_TAG, productTag, revalidateStorefront } from "../utils/revalidate.js";

export const checkout = async (req, res) => {
    try {
        const { items, shippingAddress, paymentType, shipmentType, cartId } = req.body

        // 1. Validate items and stock availability
        const itemsFromDB = await Product.find({ _id: { $in: items.map(i => i.product) } })

        if (itemsFromDB.length !== items.length) {
            return res.status(400).json({
                success: false,
                message: "Some products are no longer available"
            })
        }

        const validItems = items.filter(item => {
            const product = itemsFromDB.find(p => p._id.toString() === item.product._id)

            if (!product) return false
            const inventoryItem = product.inventory.find(i => i.size === item.size)
            if (!inventoryItem) return false
            return inventoryItem.quantity >= item.quantity
        })

        if (validItems.length !== items.length) {
            return res.status(400).json({
                success: false,
                message: "Some products are not available in the selected quantity"
            })
        }

        // 2. Calculate costs
        let shipmentFee = 0
        if (shipmentType === "standard") {
            shipmentFee = 15 // Example value
        } else if (shipmentType === "local_pickup") {
            shipmentFee = 0
        }

        let itemsPrice = 0
        const orderItems = items.map(item => {
            const product = itemsFromDB.find(p => p._id.toString() === item.product._id)
            const price = product.discountPrice > 0 ? product.discountPrice : product.price
            itemsPrice += price * item.quantity  // keep in USD

            return {
                product: product._id,
                name: product.name,
                image: product.images[0],
                sku: product.sku,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                price: price
            }
        })

        const totalPrice = (itemsPrice + shipmentFee).toFixed(2)  // USD

        // 3. Create initial order in DB
        const order = new Order({
            user: req.user?._id || null,
            items: orderItems,
            shippingAddress,
            shipmentType,
            paymentType,
            itemsPrice,
            shippingPrice: shipmentFee,
            totalPrice,
            paymentStatus: 'unpaid',
            status: 'pending',
            cartId: cartId || null
        })

        const createdOrder = await order.save()

        // 4. Handle Paystack Payment
        if (paymentType === 'paystack') {
            // Paystack requires amount in NGN kobo — convert from USD to NGN
            const totalPriceInNGN = (totalPrice * 1500).toFixed(2)
            const paystackData = await initializeTransaction(
                shippingAddress.email,
                totalPriceInNGN,
                { orderId: createdOrder._id, userId: req.user?._id || 'guest' }
            )

            return res.status(200).json({
                success: true,
                message: "Order created, redirecting to payment",
                order: createdOrder,
                paymentUrl: paystackData.data.authorization_url,
                reference: paystackData.data.reference
            })
        }

        // 5. Handle other payment types (Bank Transfer / COD)
        // Clear cart immediately for non-online payments
        if (req.user) {
            await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] })
        } else if (req.cartId) {
            await Cart.findOneAndUpdate({ cartId: req.cartId }, { items: [] })
        }

        sendEmail({
            to: shippingAddress.email,
            subject: `Order Received - ${createdOrder.orderNumber}`,
            html: orderConfirmationEmail(createdOrder),
        });

        res.status(201).json({
            success: true,
            message: "Order placed successfully, Check you mail for more information!",
            order: createdOrder
        })

    } catch (error) {
        console.error("Checkout Error:", error)
        res.status(500).json({
            success: false,
            message: "Server error during checkout",
            error: error.message
        })
    }
}

export const verifyOrder = async (req, res) => {
    try {
        const { reference } = req.params;

        // 1. Check if order is already marked as paid in our DB
        let order = await Order.findOne({ "paymentResult.reference": reference });

        if (order && order.paymentStatus === 'paid') {
            return res.status(200).json({
                success: true,
                message: "Order already paid",
                order
            });
        }

        // 2. If not paid in DB, verify with Paystack directly
        // (This handles cases where the webhook might be delayed)
        const paystackData = await verifyTransaction(reference);

        if (paystackData.data.status === 'success') {
            const { orderId } = paystackData.data.metadata;
            order = await Order.findById(orderId);

            if (order && order.paymentStatus !== 'paid') {
                // Update order
                order.paymentStatus = 'paid';
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: paystackData.data.id,
                    status: paystackData.data.status,
                    reference: paystackData.data.reference
                };
                await order.save();

                // Reduce Stock
                const stockSlugs = [];
                for (const item of order.items) {
                    const product = await Product.findById(item.product);
                    if (product) {
                        stockSlugs.push(product.slug);
                        const invIndex = product.inventory.findIndex(i => i.size === item.size);
                        if (invIndex !== -1) {
                            const availableQty = product.inventory[invIndex].quantity;
                            const newQty = availableQty - item.quantity <= 0 ? 0 : availableQty - item.quantity;

                            await Product.updateOne(
                                { _id: item.product, "inventory.size": item.size },
                                {
                                    $set: {
                                        "inventory.$.quantity": newQty
                                    },
                                    $inc: {
                                        sold: item.quantity
                                    }
                                }
                            );
                        }
                    }
                }

                revalidateStorefront([PRODUCTS_TAG, ...stockSlugs.map(productTag)]);

                // Clear Cart
                if (order.user) {
                    await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
                } else if (order.cartId) {
                    await Cart.findOneAndUpdate({ _id: order.cartId }, { items: [] });
                }
            }

            return res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                order
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
                status: paystackData.data.status
            });
        }

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during verification",
            error: error.message
        });
    }
}

export const paystackWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-paystack-signature'];
        const body = req.body;

        if (!verifySignature(signature, req.rawBody)) {
            return res.status(401).json({ message: 'Invalid signature' });
        }

        // Event type check
        if (body.event === 'charge.success') {
            const { orderId } = body.data.metadata;

            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            if (order.paymentStatus === 'paid') {
                return res.status(200).json({ message: 'Order already processed' });
            }

            // 1. Update Order Status
            order.paymentStatus = 'paid';
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: body.data.id,
                status: body.data.status,
                reference: body.data.reference
            };
            await order.save();

            // 2. Reduce Stock
            const stockSlugs = [];
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    stockSlugs.push(product.slug);
                    const invIndex = product.inventory.findIndex(i => i.size === item.size);
                    if (invIndex !== -1) {
                        const availableQty = product.inventory[invIndex].quantity;
                        const newQty = availableQty - item.quantity <= 0 ? 0 : availableQty - item.quantity;

                        await Product.updateOne(
                            { _id: item.product, "inventory.size": item.size },
                            {
                                $set: {
                                    "inventory.$.quantity": newQty
                                },
                                $inc: {
                                    sold: item.quantity
                                }
                            }
                        );
                    }
                }
            }

            revalidateStorefront([PRODUCTS_TAG, ...stockSlugs.map(productTag)]);

            // 3. Clear Cart
            if (order.user) {
                await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
            } else if (order.cartId) {
                await Cart.findOneAndUpdate({ _id: order.cartId }, { items: [] });
            }


            sendEmail({
                to: order.shippingAddress.email,
                subject: `Order Received - ${order.orderNumber}`,
                html: orderConfirmationEmail(order),
            });

            console.log(`Order ${orderId} fulfilled successfully via Paystack`);
        }

        res.status(200).json({ message: 'Webhook processed' });
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const trackOrder = async (req, res) => {
    try {
        const { orderNumber, email } = req.query;

        if (!orderNumber || !email) {
            return res.status(400).json({
                success: false,
                message: "Order number and email are required"
            });
        }

        const order = await Order.findOne({
            orderNumber,
            'shippingAddress.email': email.toLowerCase()
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "No order found with this order number and email combination"
            });
        }

        // Return sanitized order data (no internal IDs or sensitive payment info)
        const trackedOrder = {
            orderNumber: order.orderNumber,
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            items: order.items.map(item => ({
                name: item.name,
                image: item.image,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                price: item.price
            })),
            shippingAddress: {
                firstName: order.shippingAddress.firstName,
                city: order.shippingAddress.city,
                state: order.shippingAddress.state,
                country: order.shippingAddress.country
            },
            shipmentType: order.shipmentType,
            totalPrice: order.totalPrice,
            shippingPrice: order.shippingPrice,
            isPaid: order.isPaid,
            paidAt: order.paidAt,
            isDelivered: order.isDelivered,
            deliveredAt: order.deliveredAt
        };

        res.status(200).json({
            success: true,
            order: trackedOrder
        });

    } catch (error) {
        console.error("Track Order Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while tracking order",
            error: error.message
        });
    }
}
