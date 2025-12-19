import cloudinary from "../../config/cloudinary.js";
import MarketingCampaignModel from "../../models/marketeingCampaign/MarketingCampaignModel.js";

export const CreateMarketingCampaignService = async (req, res) => {
    try {

        const role = req.headers['role'];
        const { title, subtitle, categoryId, brandId, productId, isActive, remark, badgeColor } = req.body;

        if(role === "superadmin" || role === "admin"){

            // Check if an image file was uploaded
            if (!req.file) {
                return { status: "fail", message: "Image is required!" };
            }

            const campaignImage = req.file.path;

            // Store image into cloudinary
            const response = await cloudinary.uploader.upload(campaignImage, {
                folder: 'Tajir/campaigns',
            });

            const data = await MarketingCampaignModel.create({
                title,
                subtitle,
                categoryId,
                brandId,
                productId,
                isActive,
                remark,
                badgeColor,
                image: response.secure_url,
            });

            return { status: "success", message: "Campaign created successful!", data: data };


        }else {
            return { status: "fail", message: "You are not authorized!" };
        }


    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
}