import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import InvoiceModel from "../../models/invoice/InvoiceModel.js";
import ProductsModel from "../../models/products/ProductsModel.js";
import ProductVariantModel from "../../models/productVariant/ProductVariantModel.js";
import SalesModel from "../../models/sales/SalesModel.js";

export const UpdateInvoiceListService = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user_id = new ObjectId(req.headers['user_id']);
        const role = req.headers['role'];
        const id = new ObjectId(req.params.id);
        const postBody = req.body;

        // Authorization check
        if (!(role === "superadmin" || role === "admin")) {
            await session.abortTransaction();
            return { status: "fail", message: "You are not authorized!" };
        }

        // Get the invoice with products
        const invoice = await InvoiceModel.findById(id).session(session);
        if (!invoice) {
            await session.abortTransaction();
            return { status: "fail", message: "Invoice not found" };
        }

        // Status change checks
        const isStatusChangedToDelivered =
            postBody.delivery_status === "delivered" &&
            invoice.delivery_status !== "delivered";

        const isStatusChangedToReturnOrCancel =
            (postBody.delivery_status === "return" || postBody.delivery_status === "cancelled") &&
            invoice.delivery_status !== postBody.delivery_status;

        const wasAlreadyReturnOrCancelled =
            invoice.delivery_status === "return" || invoice.delivery_status === "cancelled";

        // Update invoice
        const result = await InvoiceModel.updateOne(
            { _id: id },
            {
                $set: {
                    delivery_status: postBody.delivery_status,
                    paymentMethod: postBody.paymentMethod || invoice.paymentMethod,
                    ship_details: postBody.ship_details || invoice.ship_details,
                    updatedAt: new Date()
                }
            },
            { session }
        );

        if (result.modifiedCount !== 1) {
            await session.abortTransaction();
            return { status: "fail", message: "No changes made or order not found" };
        }

        // If status changed to delivered, create a sale record
        if (isStatusChangedToDelivered) {
            const customerId = invoice.customerId || new ObjectId("000000000000000000000000");
            let customerName = 'Walk-in Customer';
            if (typeof invoice.ship_details === 'string') {
                const nameMatch = invoice.ship_details.match(/Name:([^,]+)/);
                customerName = nameMatch?.[1]?.trim() || customerName;
            }

            const saleItems = invoice.products.map(product => ({
                productId: product.productId || new ObjectId(),
                productName: product.name || 'Unknown Product',
                qty: product.quantity || 1,
                unitCost: product.price / (product.quantity || 1),
                total: product.price
            }));

            const grandTotal = invoice.sub_total ||
                saleItems.reduce((sum, item) => sum + item.total, 0);

            const saleData = {
                userId: user_id,
                customerId: customerId,
                customerName: customerName,
                items: saleItems,
                grandTotal: grandTotal,
                shippingCost: invoice.shippingCost || 0,
                vatTax: invoice.vatTax || 0,
                discount: invoice.discount || 0,
                otherCost: invoice.otherCost || 0,
                note: `Sale generated from invoice ${invoice._id}`,
                regionId: invoice.regionId,
                thanaId: invoice.thanaId,
                districtId: invoice.districtId,
                divisionId: invoice.divisionId
            };

            await SalesModel.create([saleData], { session });
        }

        // If status changed to return or cancel, restore product & variant stock
        if (isStatusChangedToReturnOrCancel && !wasAlreadyReturnOrCancelled) {
            for (const productItem of invoice.products) {
                // Increase main product stock
                await ProductsModel.updateOne(
                    { _id: productItem.productId },
                    { $inc: { stock: productItem.quantity } },
                    { session }
                );

                // Restore stock in product variants
                if (productItem.color && productItem.size) {
                    // Scenario1: color + size
                    await ProductVariantModel.updateOne(
                        {
                            productId: productItem.productId,
                            "scenario1.color": productItem.color,
                            "scenario1.sizes.size": productItem.size
                        },
                        {
                            $inc: { "scenario1.$[c].sizes.$[s].qty": productItem.quantity }
                        },
                        {
                            arrayFilters: [
                                { "c.color": productItem.color },
                                { "s.size": productItem.size }
                            ],
                            session
                        }
                    );
                } else if (productItem.color && !productItem.size) {
                    // Scenario2: color only
                    await ProductVariantModel.updateOne(
                        {
                            productId: productItem.productId,
                            "scenario2.color": productItem.color
                        },
                        {
                            $inc: { "scenario2.$[c].qty": productItem.quantity }
                        },
                        {
                            arrayFilters: [{ "c.color": productItem.color }],
                            session
                        }
                    );
                } else {
                    // Scenario3: no color, no size
                    await ProductVariantModel.updateOne(
                        { productId: productItem.productId },
                        { $inc: { "scenario3.0.qty": productItem.quantity } },
                        { session }
                    );
                }
            }
        }

        await session.commitTransaction();
        return { status: "success", message: "Order updated successfully" };

    } catch (e) {
        await session.abortTransaction();
        console.error("Update invoice error:", e);
        return { status: "error", message: e.toString() };
    } finally {
        session.endSession();
    }
};
