import cloudinary from "../../config/cloudinary.js";
import ProductsModel from "../../models/products/ProductsModel.js";
import fs from 'fs';
import {ALL_DEFAULT_IMAGE} from "../../config/config.js";

export const CreateProductService = async (req, res) => {
    try {
        const role = req.headers['role'];

        if (role !== "superadmin" && role !== "admin") {
            return { status: "fail", message: "You are not authorized!" };
        }

        // Parse form data
        const {
            name, price, discount, discountPrice, stock, size, remark, catName, unit,
            details, specification, videoUrl, campaignId, brandId, categoryId,
            subCategoryId, subSubCategoryId
        } = req.body;

        // Handle main image upload
        let imageUrl = ALL_DEFAULT_IMAGE;
        if (req.files && req.files.image) {
            const uploadResponse = await cloudinary.uploader.upload(req.files.image[0].path, {
                folder: 'Tajir/products'
            });
            imageUrl = uploadResponse.secure_url;
            fs.unlinkSync(req.files.image[0].path);
        }

        // Handle hover image upload
        let hoverImageUrl = ALL_DEFAULT_IMAGE;
        if (req.files && req.files.hoverImage) {
            const hoverUploadResponse = await cloudinary.uploader.upload(req.files.hoverImage[0].path, {
                folder: 'Tajir/products/hoverImage'
            });
            hoverImageUrl = hoverUploadResponse.secure_url;
            fs.unlinkSync(req.files.hoverImage[0].path);
        }

        // Create product
        const newProduct = await ProductsModel.create({
            name,
            price: parseFloat(price) || 0,
            discount: parseFloat(discount) || 0,
            discountPrice: parseFloat(discountPrice) || 0,
            stock: parseInt(stock) || 0,
            size,
            remark,
            catName,
            unit,
            details,
            specification,
            videoUrl,
            image: imageUrl,
            hoverImage: hoverImageUrl, // Added hoverImage field
            campaignId: campaignId || null,
            brandId: brandId || null,
            categoryId: categoryId || null,
            subCategoryId: subCategoryId || null,
            subSubCategoryId: subSubCategoryId || null,
        });

        return {
            status: "success",
            message: "Product created successfully!",
            data: newProduct,
        };

    } catch (e) {
        console.error("CreateProductService error:", e);
        return {
            status: "fail",
            message: e.message || "Something went wrong!",
            error: e.errors
        };
    }
};