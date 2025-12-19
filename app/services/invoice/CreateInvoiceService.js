// services/invoiceService.js
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import ProductsModel from "../../models/products/ProductsModel.js";
import ProductVariantModel from "../../models/productVariant/ProductVariantModel.js";
import InvoiceModel from "../../models/invoice/InvoiceModel.js";
import CartModel from "../../models/cart/CartModel.js";

export const CreateInvoiceService = async (req) => {
    const session = await mongoose.startSession();

    try {
        await session.startTransaction();

        // 🔥 OPTIMIZATION: Early validation before transaction
        const { body, headers, cookies } = req;

        // Validate required fields early
        const requiredFields = [
            'name', 'phone', 'area', 'thana', 'district', 'division',
            'shippingOption', 'shippingCost', 'subtotal', 'totalPayable', 'products'
        ];

        const missingFields = requiredFields.filter(field => !body[field]);
        if (missingFields.length > 0) {
            return {
                status: "fail",
                message: `Missing required fields: ${missingFields.join(', ')}`
            };
        }

        if (!body.products || body.products.length === 0) {
            return { status: "fail", message: "No products in order!" };
        }

        // 🔥 OPTIMIZATION: Parse and validate user identification early
        let userId = null;
        let guestId = null;
        let isGuestUser = false;

        // User identification logic
        if (headers['user_id'] && ObjectId.isValid(headers['user_id'])) {
            userId = new ObjectId(headers['user_id']);
        } else if (cookies?.guestId) {
            guestId = cookies.guestId;
            isGuestUser = true;
        } else if (headers['guest_id']) {
            guestId = headers['guest_id'];
            isGuestUser = true;
        } else if (body.products?.length > 0) {
            isGuestUser = true;
            guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        } else {
            return { status: "fail", message: "User identification required" };
        }

        const {
            name,
            phone,
            altPhone,
            area,
            thana,
            district,
            division,
            shippingOption,
            shippingCost,
            subtotal,
            totalPayable,
            paymentMethod,
            products,
            cartItems
        } = body;

        // 🔥 OPTIMIZATION: Pre-process products in parallel
        const productIds = products.map(p =>
            typeof p.productId === 'string' ? new ObjectId(p.productId) : p.productId
        );

        // 🔥 OPTIMIZATION: Bulk fetch products instead of individual queries
        const dbProducts = await ProductsModel.find(
            { _id: { $in: productIds } },
            { name: 1, price: 1, discount: 1, stock: 1, image: 1, colorVariants: 1 }
        ).session(session).lean();

        const productMap = new Map();
        dbProducts.forEach(product => {
            productMap.set(product._id.toString(), product);
        });

        let invoiceProducts = [];
        let productsToUpdate = [];
        const isCartOrder = products && products.length > 0 &&
            (products[0].fromCart === true || cartItems);

        // 🔥 OPTIMIZATION: Process products with early stock validation
        for (const product of products) {
            const productId = typeof product.productId === 'string' ?
                new ObjectId(product.productId) : product.productId;

            const dbProduct = productMap.get(productId.toString());
            if (!dbProduct) {
                await session.abortTransaction();
                return { status: "fail", message: `Product not found: ${productId}` };
            }

            // Early stock validation
            if (dbProduct.stock < product.quantity) {
                await session.abortTransaction();
                return {
                    status: "fail",
                    message: `Insufficient stock for ${dbProduct.name}. Available: ${dbProduct.stock}, Requested: ${product.quantity}`
                };
            }

            const price = product.price ||
                (dbProduct.discount > 0 ? (dbProduct.price - dbProduct.discount) : dbProduct.price);

            invoiceProducts.push({
                productId,
                name: product.name || dbProduct.name,
                image: product.image || dbProduct.image,
                quantity: product.quantity,
                price: price,
                color: product.color || null,
                size: product.size || null,
            });

            productsToUpdate.push({
                productId,
                quantity: product.quantity,
                color: product.color || null,
                size: product.size || null,
                hasColorVariants: Array.isArray(dbProduct.colorVariants) && dbProduct.colorVariants.length > 0,
                dbProduct: dbProduct
            });
        }

        // 🔥 OPTIMIZATION: Clear cart in bulk if it's a cart order
        if (isCartOrder) {
            console.log("Processing cart order with products:", products.length);

            if (cartItems && cartItems.length > 0) {
                const cartItemIds = cartItems.map(item => new ObjectId(item._id));
                const deleteResult = await CartModel.deleteMany({
                    _id: { $in: cartItemIds }
                }).session(session);
                console.log(`Cleared ${deleteResult.deletedCount} cart items`);
            } else {
                const clearCartQuery = isGuestUser ? { guestId } : { userId };
                await CartModel.deleteMany(clearCartQuery).session(session);
            }
        } else {
            console.log("Processing buy now order");
        }

        // 🔥 OPTIMIZATION: Prepare invoice data
        const ship_details = `Name:${name}, Number:${phone}, AlternateNumber:${altPhone || 'N/A'}, Area:${area}, Thana:${thana}, District:${district}, Division:${division}`;
        const tran_id = Math.floor(10000000 + Math.random() * 90000000).toString();

        const invoiceData = {
            userId: userId,
            sub_total: parseFloat(subtotal),
            shippingCost: parseFloat(shippingCost),
            payable: parseFloat(totalPayable),
            shiping_area: shippingOption,
            ship_details,
            tran_id,
            val_id: "0",
            payment_status: "pending",
            delivery_status: "pending",
            paymentMethod: paymentMethod || 'cash_on_delivery',
            products: invoiceProducts
        };

        if (isGuestUser) invoiceData.guestId = guestId;

        // 🔥 OPTIMIZATION: Create invoice
        const newInvoice = await InvoiceModel.create([invoiceData], { session });

        // 🔥 OPTIMIZATION: Bulk stock updates
        const stockUpdates = [];
        const variantUpdates = [];

        for (const item of productsToUpdate) {
            // Main product stock update
            stockUpdates.push(
                ProductsModel.updateOne(
                    { _id: item.productId },
                    { $inc: { stock: -item.quantity } },
                    { session }
                )
            );

            // Variant updates based on scenario
            if (item.color && item.size) {
                variantUpdates.push(
                    ProductVariantModel.updateOne(
                        {
                            productId: item.productId,
                            "scenario1.color": item.color,
                            "scenario1.sizes.size": item.size
                        },
                        { $inc: { "scenario1.$[c].sizes.$[s].qty": -item.quantity } },
                        {
                            arrayFilters: [
                                { "c.color": item.color },
                                { "s.size": item.size }
                            ],
                            session
                        }
                    )
                );
            } else if (item.color && !item.size) {
                variantUpdates.push(
                    ProductVariantModel.updateOne(
                        { productId: item.productId, "scenario2.color": item.color },
                        { $inc: { "scenario2.$[c].qty": -item.quantity } },
                        {
                            arrayFilters: [{ "c.color": item.color }],
                            session
                        }
                    )
                );
            } else {
                variantUpdates.push(
                    ProductVariantModel.updateOne(
                        { productId: item.productId },
                        { $inc: { "scenario3.0.qty": -item.quantity } },
                        { session }
                    )
                );
            }
        }

        // 🔥 OPTIMIZATION: Execute all updates in parallel
        await Promise.all([...stockUpdates, ...variantUpdates]);

        await session.commitTransaction();

        return {
            status: "success",
            message: "Order created successfully! Wait for confirmation.",
            data: {
                invoiceId: newInvoice[0]._id,
                tran_id,
                totalPayable: totalPayable
            }
        };

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.error("Invoice creation error:", error);
        return {
            status: "error",
            message: "Failed to create invoice",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        };
    } finally {
        await session.endSession();
    }
};