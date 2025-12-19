import { ObjectId } from "mongodb";
import ProductsModel from "../../models/products/ProductsModel.js";
import cloudinary from "../../config/cloudinary.js";
import ProductVariantModel from "../../models/productVariant/ProductVariantModel.js";
import {ALL_DEFAULT_IMAGE} from "../../config/config.js";

export const ProductDeleteService = async (req, res) => {
    try {
        const id = new ObjectId(req.params["id"]);

        // Find product and its variants
        const product = await ProductsModel.findOne({ _id: id });
        const variants = await ProductVariantModel.find({ productId: id });

        if (!product) {
            return { status: "fail", message: "Product not found" };
        }

        // Collect all image URLs from product (stored in Tajir/product)
        const productImageUrls = [product.image].filter(Boolean);

        // Collect all image URLs from variants (stored in Tajir/productVariant)
        const variantImageUrls = variants.map(variant => variant.image).filter(Boolean);

        // Delete product image (if exists and not default)
        if (product.image && product.image !== ALL_DEFAULT_IMAGE) {
            const productParts = product.image.split('/');
            const productFilename = productParts[productParts.length - 1];
            const productPublicId = `Tajir/products/${productFilename.split('.')[0]}`;

            await cloudinary.uploader.destroy(productPublicId)
                .catch(e => console.error(`Failed to delete product image ${productPublicId}:`, e));
        }

        // Delete variant images
        for (const variant of variants) {
            if (variant.image && variant.image !== ALL_DEFAULT_IMAGE) {
                const variantParts = variant.image.split('/');
                const variantFilename = variantParts[variantParts.length - 1];
                const variantPublicId = `Tajir/productVariant/${variantFilename.split('.')[0]}`;

                await cloudinary.uploader.destroy(variantPublicId)
                    .catch(e => console.error(`Failed to delete variant image ${variantPublicId}:`, e));
            }
        }

        // Delete all variants associated with the product
        await ProductVariantModel.deleteMany({ productId: id });

        // Delete the product itself
        await ProductsModel.deleteOne({ _id: id });

        return { status: "success", message: "Product and variants deleted successfully!" };
    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};