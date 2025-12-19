
import mongoose from "mongoose";
import SaleModel from "../../models/sales/SalesModel.js";
import ProductVariantModel from "../../models/productVariant/ProductVariantModel.js";

export const CreateSales = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.headers.user_id;
        if (!userId) {
            await session.abortTransaction();
            return res.status(401).json({
                status: "fail",
                message: "User not authenticated"
            });
        }

        const {
            customerId,
            customerName,
            regionId,
            thanaId,
            districtId,
            divisionId,
            vatTax,
            discount,
            otherCost,
            shippingCost,
            grandTotal,
            note,
            items
        } = req.body;

        // Validate required fields
        if (!customerId || !items || items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({
                status: "fail",
                message: "Customer and items are required"
            });
        }

        // Calculate grand total
        const subtotal = items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
        const vatAmount = (vatTax || 0) / 100 * subtotal;
        const calculatedGrandTotal = subtotal + vatAmount - (discount || 0) + (otherCost || 0) + (shippingCost || 0);

        // Create sale document
        const newSale = new SaleModel({
            userId,
            customerId,
            customerName,
            regionId,
            thanaId,
            districtId,
            divisionId,
            items,
            vatTax: vatTax || 0,
            discount: discount || 0,
            otherCost: otherCost || 0,
            shippingCost: shippingCost || 0,
            grandTotal: calculatedGrandTotal,
            note
        });

        // Process each item in the sale
        for (const item of items) {
            if (!item.variants || item.variants.length === 0) {
                await session.abortTransaction();
                return res.status(400).json({
                    status: "fail",
                    message: `No variants specified for product ${item.productName || item.productId}`
                });
            }

            // Find ALL variant documents for this product
            const productVariants = await ProductVariantModel.find({
                productId: item.productId
            }).session(session);

            if (productVariants.length === 0) {
                await session.abortTransaction();
                return res.status(400).json({
                    status: "fail",
                    message: `No product variants found for product ID: ${item.productId}`
                });
            }

            // Process each variant in the item
            for (const variant of item.variants) {
                let variantUpdated = false;

                // Search through all variant documents for this product
                for (const productVariant of productVariants) {
                    try {
                        switch (variant.scenarioType) {
                            case 'scenario1':
                                const colorGroup = productVariant.scenario1.find(
                                    g => g.color?.trim().toLowerCase() === variant.color?.trim().toLowerCase()
                                );

                                if (colorGroup) {
                                    const sizeItem = colorGroup.sizes.find(
                                        s => s.size?.trim().toLowerCase() === variant.size?.trim().toLowerCase()
                                    );

                                    if (sizeItem && sizeItem.qty >= variant.qty) {
                                        sizeItem.qty -= variant.qty;
                                        productVariant.markModified('scenario1');
                                        await productVariant.save({ session });
                                        variantUpdated = true;
                                        break;
                                    }
                                }
                                break;

                            case 'scenario2':
                                const colorVariant = productVariant.scenario2.find(
                                    v => v.color?.trim().toLowerCase() === variant.color?.trim().toLowerCase()
                                );

                                if (colorVariant && colorVariant.qty >= variant.qty) {
                                    colorVariant.qty -= variant.qty;
                                    productVariant.markModified('scenario2');
                                    await productVariant.save({ session });
                                    variantUpdated = true;
                                    break;
                                }
                                break;

                            case 'scenario3':
                                if (productVariant.scenario3.length > 0 &&
                                    productVariant.scenario3[0].qty >= variant.qty) {
                                    productVariant.scenario3[0].qty -= variant.qty;
                                    productVariant.markModified('scenario3');
                                    await productVariant.save({ session });
                                    variantUpdated = true;
                                    break;
                                }
                                break;

                            default:
                                await session.abortTransaction();
                                return res.status(400).json({
                                    status: "fail",
                                    message: `Invalid variant type: ${variant.scenarioType}`
                                });
                        }
                    } catch (error) {
                        await session.abortTransaction();
                        return res.status(500).json({
                            status: "error",
                            message: `Error processing variant: ${error.message}`
                        });
                    }

                    if (variantUpdated) break;
                }

                if (!variantUpdated) {
                    await session.abortTransaction();
                    return res.status(400).json({
                        status: "fail",
                        message: `Insufficient stock for ${variant.scenarioType === 'scenario1' ?
                            `${variant.color}/${variant.size}` :
                            variant.scenarioType === 'scenario2' ?
                                variant.color : 'standard product'}`
                    });
                }
            }
        }

        // Save the sale and commit transaction
        await newSale.save({ session });
        await session.commitTransaction();

        return res.status(200).json({
            status: "success",
            message: "Sale created successfully",
            data: newSale
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Error in CreateSales:", error);
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    } finally {
        session.endSession();
    }
};

export const SalesList = async (req, res) => {
    try {
        const pageNo = Number(req.params.pageNo);
        const perPage = Number(req.params.perPage);
        const searchKeyword = req.params.searchKeyword;

        let query = {};

        if (searchKeyword !== "0") {
            query.$or = [
                { customerName: { $regex: searchKeyword, $options: "i" } },
                { "items.productName": { $regex: searchKeyword, $options: "i" } },
                { note: { $regex: searchKeyword, $options: "i" } }
            ];
        }

        const skipRow = (pageNo - 1) * perPage;

        const total = await SaleModel.countDocuments(query);
        const data = await SaleModel.find(query)
            .skip(skipRow)
            .limit(perPage)
            .sort({ createdAt: -1 });

        // Transform data for backward compatibility
        const transformedData = data.map(sale => {
            const saleObj = sale.toObject();

            // For single item sales, add direct product fields
            if (sale.items.length === 1) {
                saleObj.productId = sale.items[0].productId;
                saleObj.productName = sale.items[0].productName;
            }

            return saleObj;
        });

        res.status(200).json({
            status: "success",
            data: transformedData,
            total: total,
            perPage: perPage,
            currentPage: pageNo
        });
    } catch (error) {
        res.status(200).json({
            status: "fail",
            message: error.message
        });
    }
};

export const DeleteSale = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(200).json({
                status: "fail",
                message: "Invalid sale ID"
            });
        }

        const result = await SaleModel.findByIdAndDelete(id);

        if (!result) {
            return res.status(200).json({
                status: "fail",
                message: "Sale not found"
            });
        }

        res.status(200).json({
            status: "success",
            message: "Sale deleted successfully"
        });
    } catch (error) {
        res.status(200).json({
            status: "fail",
            message: error.message
        });
    }
};