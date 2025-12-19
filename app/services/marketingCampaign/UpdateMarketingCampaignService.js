import cloudinary from "../../config/cloudinary.js";
import { ObjectId } from "mongodb";
import MarketingCampaignModel from "../../models/marketeingCampaign/MarketingCampaignModel.js";

export const UpdateMarketingCampaignService = async (req, res) => {
    try {
        const role = req.headers["role"];
        const id = new ObjectId(req.params.id);
        console.log('id', id);
        const { title, subtitle, categoryId, brandId, productId, isActive, remark, badgeColor} = req.body;

        if (role !== "superadmin" && role !== "admin") {
            return { status: "fail", message: "You are not authorized!" };
        }

        const existingCampaign = await MarketingCampaignModel.findById(id);

        console.log('existingCampaign', existingCampaign);
        if (!existingCampaign) {
            return { status: "fail", message: "Campaign image not found!" };
        }

        let updatedImageUrl = existingCampaign.image;

        if (req.file) {
            // Step 1: Delete old image from Cloudinary
            if (existingCampaign.image) {
                const imageUrl = existingCampaign.image;
                const parts = imageUrl.split('/');
                const fileNameWithExt = parts[parts.length - 1]; // abc123.jpg
                const fileNameWithoutExt = fileNameWithExt.split('.')[0]; // abc123
                const publicId = `Tajir/campaigns/${fileNameWithoutExt}`;

                await cloudinary.uploader.destroy(publicId);
            }

            // Step 2: Upload new image
            const response = await cloudinary.uploader.upload(req.file.path, {
                folder: "Tajir/campaigns",
            });
            updatedImageUrl = response.secure_url;
        }

        const JsonBody = {
            title,
            subtitle,
            categoryId,
            brandId,
            productId,
            isActive,
            remark,
            badgeColor,
            image: updatedImageUrl,
        };

        const data = await MarketingCampaignModel.updateOne({ _id: id }, { $set: JsonBody });

        return { status: "success", message: "Campaign updated successfully!", data };

    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};
