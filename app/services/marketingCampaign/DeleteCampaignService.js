import {ObjectId} from "mongodb";
import MarketingCampaignModel from "../../models/marketeingCampaign/MarketingCampaignModel.js";
import cloudinary from "../../config/cloudinary.js";

export const DeleteCampaignService = async (req, res) => {

    try{

        const id = new ObjectId(req.params['id']);

        const data = await MarketingCampaignModel.findOne({_id: id});

        if(data.isActive === true){
            return { status: "fail", message: "Can't delete! Campaign is active!" };
        }else {

            // Extract the public ID from the image URL
            const imageUrl = data.image;
            const parts = imageUrl.split('/');
            const publicIdWithExtension = parts[parts.length - 1]; // e.g., abc123.jpg
            const publicId = `Tajir/campaigns/${publicIdWithExtension.split('.')[0]}`; // e.g., Tajir/brands/abc123

            await cloudinary.uploader.destroy(publicId);


            await MarketingCampaignModel.deleteOne({_id: id});

            return { status: "success", message: "Delete successful!", };
        }

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}