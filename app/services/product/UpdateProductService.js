import ProductsModel from "../../models/products/ProductsModel.js";
import cloudinary from "../../config/cloudinary.js";
import { ObjectId } from "mongodb";
import fs from 'fs';
import { ALL_DEFAULT_IMAGE } from "../../config/config.js";

export const UpdateProductService = async (req, res) => {
    try {
        const role = req.headers['role'];
        const id = new ObjectId(req.params.id);

        if (role !== "superadmin" && role !== "admin") {
            return { status: "fail", message: "You are not authorized!" };
        }

        const existingProduct = await ProductsModel.findById(id);
        if (!existingProduct) {
            return { status: "fail", message: "Product not found!" };
        }

        // Parse form data
        const {
            name, price, discount, discountPrice, stock, size, remark, catName, unit,
            videoUrl, details, specification, campaignId, brandId, categoryId,
            subCategoryId, subSubCategoryId, colorVariants
        } = req.body;

        // Parse and validate colorVariants
        let parsedColorVariants = [];
        try {
            parsedColorVariants = typeof colorVariants === 'string' ?
                JSON.parse(colorVariants) :
                (colorVariants || []);

            // Validate each variant
            parsedColorVariants = parsedColorVariants.map(variant => ({
                color: (variant.color || '').trim(),
                quantity: parseInt(variant.quantity) || 0
            })).filter(variant => variant.color !== '');
        } catch (e) {
            console.error("Error parsing colorVariants:", e);
            return { status: "fail", message: "Invalid color variants format" };
        }

        // Prepare update fields - FIXED: Handle empty strings properly
        const updateFields = {
            name: name !== undefined ? name : existingProduct.name,
            price: parseFloat(price) || 0,
            discount: parseFloat(discount) || 0,
            discountPrice: parseFloat(discountPrice) || 0,
            stock: parseInt(stock) || 0,
            colorVariants: parsedColorVariants,
            size: size !== undefined ? size : existingProduct.size,
            remark: remark !== undefined ? remark : existingProduct.remark, // This allows empty strings
            catName: catName !== undefined ? catName : existingProduct.catName,
            unit: unit !== undefined ? unit : existingProduct.unit,
            videoUrl: videoUrl !== undefined ? videoUrl : existingProduct.videoUrl,
            details: details !== undefined ? details : existingProduct.details,
            specification: specification !== undefined ? specification : existingProduct.specification,
            campaignId: campaignId || null,
            brandId: brandId || null,
            categoryId: categoryId || null,
            subCategoryId: subCategoryId || null,
            subSubCategoryId: subSubCategoryId || null,
        };

        // Handle main image upload
        if (req.files && req.files.image) {
            const file = req.files.image[0];

            // Delete old image if not default
            if (existingProduct.image && existingProduct.image !== ALL_DEFAULT_IMAGE) {
                try {
                    const publicId = existingProduct.image.split('/').slice(-2).join('/').split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    console.error(`Cloudinary delete failed for image:`, error.message);
                }
            }

            // Upload new image
            try {
                const uploaded = await cloudinary.uploader.upload(file.path, {
                    folder: 'Tajir/products'
                });
                updateFields.image = uploaded.secure_url;
            } catch (uploadError) {
                console.error(`Cloudinary upload failed for image:`, uploadError.message);
                updateFields.image = existingProduct.image;
            }

            // Remove temp file
            fs.unlinkSync(file.path);
        } else {
            updateFields.image = existingProduct.image || ALL_DEFAULT_IMAGE;
        }

        // Handle hover image upload
        if (req.files && req.files.hoverImage) {
            const file = req.files.hoverImage[0];

            // Delete old hover image if not default
            if (existingProduct.hoverImage && existingProduct.hoverImage !== ALL_DEFAULT_IMAGE) {
                try {
                    const publicId = existingProduct.hoverImage.split('/').slice(-2).join('/').split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    console.error(`Cloudinary delete failed for hoverImage:`, error.message);
                }
            }

            // Upload new hover image
            try {
                const uploaded = await cloudinary.uploader.upload(file.path, {
                    folder: 'Tajir/products/hoverImage'
                });
                updateFields.hoverImage = uploaded.secure_url;
            } catch (uploadError) {
                console.error(`Cloudinary upload failed for hoverImage:`, uploadError.message);
                updateFields.hoverImage = existingProduct.hoverImage;
            }

            // Remove temp file
            fs.unlinkSync(file.path);
        } else {
            updateFields.hoverImage = existingProduct.hoverImage || ALL_DEFAULT_IMAGE;
        }

        // Update in DB
        const result = await ProductsModel.updateOne(
            { _id: id },
            { $set: updateFields }
        );

        return {
            status: "success",
            message: "Product updated successfully!",
            data: result
        };

    } catch (error) {
        console.error("Error in UpdateProductService:", error);
        return {
            status: "fail",
            message: error.message || "Something went wrong!",
            error: error.errors
        };
    }
};