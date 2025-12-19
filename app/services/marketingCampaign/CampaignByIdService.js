import DataModel from "../../models/marketeingCampaign/MarketingCampaignModel.js";

export const CampaignByIdService = async (req, DataModel, MatchQuery, JoinStage1, JoinStage2, UnwindBrandStage, UnwindCategoryStage, Projection) => {

    try{

        const data = await DataModel.aggregate([
            JoinStage1,
            JoinStage2,
            UnwindBrandStage,
            UnwindCategoryStage,
            { $match: MatchQuery },
            Projection
        ]);

        return { status: "success", message: "Request Successful!", data: data };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}