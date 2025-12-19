import {ObjectId} from "mongodb";

export const MarketingCampaignListService = async (Request, DataModel, SearchArray, JoinStage1, JoinStage2, UnwindBrandStage, UnwindCategoryStage) => {

    try{

        const pageNo = Number(Request.params.pageNo);
        const perPage = Number(Request.params.perPage);
        const searchValue = Request.params.searchKeyword;

        let skipRow = (pageNo - 1) * perPage;
        let data;

        if(searchValue !== "0"){

            let searchQuery = { $or: SearchArray };

             data = await DataModel.aggregate([
                { $match: searchQuery },
                 JoinStage1,
                 JoinStage2,
                 UnwindBrandStage,
                 UnwindCategoryStage,
                {
                    $facet: {
                        Total: [{ $count: "count" }],
                        Rows: [{ $skip: skipRow }, { $limit: perPage }],
                    }
                }
            ]);

        }else{

             data = await DataModel.aggregate([
                 JoinStage1,
                 JoinStage2,
                 UnwindBrandStage,
                 UnwindCategoryStage,
                {
                    $facet: {
                        Total: [{ $count: "count" }],
                        Rows: [{ $skip: skipRow }, { $limit: perPage }],
                    }
                }
            ]);

        }

        return { status: "success", data: data };
    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}