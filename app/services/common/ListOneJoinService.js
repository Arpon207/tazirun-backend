import {ObjectId} from "mongodb";


export const ListOneJoinService = async (Request, DataModel, SearchArray, JoinStage, UnwindTypeStage, Projection) => {

    try{

        const pageNo = Number(Request.params.pageNo);
        const perPage = Number(Request.params.perPage);
        const searchValue = Request.params.searchKeyword;

        const email = Request.headers['email'];
        const userId = new ObjectId(Request.headers['user_id']);

        let skipRow = (pageNo - 1) * perPage;
        let data;

        if(searchValue !== "0"){

            let searchQuery = { $or: SearchArray };

            data = await DataModel.aggregate([
                JoinStage,
                UnwindTypeStage,
                Projection,
                { $match: searchQuery },
                {
                    $facet: {
                        Total: [{ $count: "count" }],
                        Rows: [{ $skip: skipRow }, { $limit: perPage }],
                    }
                }
            ]);

        }else{

            data = await DataModel.aggregate([
                JoinStage,
                UnwindTypeStage,
                Projection,
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