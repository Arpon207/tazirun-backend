export const AllProductDetailByCategoryNameService = async (Request, DataModel, MatchQuery, SearchArray, JoinStage1, JoinStage2, UnwindBrandStage1, UnwindBrandStage2, Projection) => {

    try{

        const pageNo = Number(Request.params.pageNo);
        const perPage = Number(Request.params.perPage);
        const searchValue = Request.params.searchKeyword;

        let skipRow = (pageNo - 1) * perPage;
        let data;

        if(searchValue !== "0"){

            let searchQuery = { $or: SearchArray };

            data = await DataModel.aggregate([
                { $match: { $and: [searchQuery, MatchQuery] } },
                JoinStage1,
                JoinStage2,
                UnwindBrandStage1,
                UnwindBrandStage2,
                {
                    $facet: {
                        Total: [{ $count: "count" }],
                        Rows: [{ $skip: skipRow }, { $limit: perPage }, Projection],
                    }
                },
            ]);

        }else{

            data = await DataModel.aggregate([
                { $match: MatchQuery },
                JoinStage1,
                JoinStage2,
                UnwindBrandStage1,
                UnwindBrandStage2,
                {
                    $facet: {
                        Total: [{ $count: "count" }],
                        Rows: [{ $skip: skipRow }, { $limit: perPage }, Projection],
                    }
                },
            ]);

        }

        return { status: "success", message: "Request Successful!", data: data };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}