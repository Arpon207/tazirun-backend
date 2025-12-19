import cloudinary from "../../config/cloudinary.js";
import ProductVariantModel from "../../models/productVariant/ProductVariantModel.js";

export const CreateProductVariantService = async (req, res) => {
    try {
        const role = req.headers['role'];
        const { productId, scenario1, scenario2, scenario3 } = req.body;

        if (role !== "superadmin" && role !== "admin") {
            return { status: "fail", message: "You are not authorized!" };
        }

        if (!productId) {
            return { status: "fail", message: "Product ID is required!" };
        }

        if (!req.file) {
            return { status: "fail", message: "Image is required!" };
        }

        const productVariantImage = req.file.path;

        // Upload image to Cloudinary
        const response = await cloudinary.uploader.upload(productVariantImage, {
            folder: 'Tajir/productVariant',
        });

        // Prepare insert data
        const insertData = {
            productId,
            image: response.secure_url,
        };

        // Parse and assign only the scenario that exists
        if (scenario1) {
            insertData.scenario1 = JSON.parse(scenario1);
        } else if (scenario2) {
            insertData.scenario2 = JSON.parse(scenario2);
        } else if (scenario3) {
            insertData.scenario3 = JSON.parse(scenario3);
        } else {
            return { status: "fail", message: "At least one scenario is required!" };
        }

        // Create product variant
        const data = await ProductVariantModel.create(insertData);

        return { status: "success", message: "Product variant created successfully!", data };

    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};
