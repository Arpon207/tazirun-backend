import cloudinary from "../../config/cloudinary.js";
import ProductVariantModel from "../../models/productVariant/ProductVariantModel.js";

export const UpdateProductVariantService = async (req, res) => {
    try {
        const role = req.headers['role'];
        const variantId = req.params.id;
        const { scenario1, scenario2, scenario3, image } = req.body;

        if (role !== "superadmin" && role !== "admin") {
            return { status: "fail", message: "You are not authorized!" };
        }

        if (!variantId) {
            return { status: "fail", message: "Variant ID is required!" };
        }

        // Find existing variant
        const existingVariant = await ProductVariantModel.findById(variantId);
        if (!existingVariant) {
            return { status: "fail", message: "Variant not found!" };
        }

        // Prepare update data
        const updateData = {};

        // Handle image update - either new file upload or existing URL
        if (req.file) {
            // Upload new image to Cloudinary
            const response = await cloudinary.uploader.upload(req.file.path, {
                folder: 'Tajir/productVariant',
            });
            updateData.image = response.secure_url;

            // Delete old image from Cloudinary if it exists and is from Cloudinary
            if (existingVariant.image && existingVariant.image.includes('cloudinary')) {
                try {
                    // Extract public_id from the existing image URL
                    const urlParts = existingVariant.image.split('/');
                    const fileNameWithExtension = urlParts[urlParts.length - 1];
                    const publicId = fileNameWithExtension.split('.')[0];
                    const fullPublicId = `Tajir/productVariant/${publicId}`;

                    await cloudinary.uploader.destroy(fullPublicId);
                } catch (deleteError) {
                    console.log('Error deleting old image from Cloudinary:', deleteError);
                    // Continue with update even if deletion fails
                }
            }
        } else if (image) {
            // Use existing image URL from form
            updateData.image = image;
        }

        // Parse and update scenarios if provided
        if (scenario1) {
            updateData.scenario1 = typeof scenario1 === 'string' ? JSON.parse(scenario1) : scenario1;
        }
        if (scenario2) {
            updateData.scenario2 = typeof scenario2 === 'string' ? JSON.parse(scenario2) : scenario2;
        }
        if (scenario3) {
            updateData.scenario3 = typeof scenario3 === 'string' ? JSON.parse(scenario3) : scenario3;
        }

        // Update variant
        const updatedVariant = await ProductVariantModel.findByIdAndUpdate(
            variantId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return {
            status: "success",
            message: "Product variant updated successfully!",
            data: updatedVariant
        };

    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};