import {ObjectId} from "mongodb";

export const UserDetailsServiceByRole = async (Request, DataModel, SearchArray, Projection) => {
    // try{
    //
    //     const userID = new ObjectId(req.headers['user_id']);
    //     const role = req.params['role'];
    //
    //     const data = await UsersModel.aggregate([
    //         { $match: { role: role } },
    //         { $project: { _id:0, password: 0, photo: 0, createdAt:0, updatedAt:0 } }
    //     ]);
    //
    //     return { status: "success", message: "Request successfully", data: data };
    // }catch (e) {
    //     return { status: "error", message: e.toString() };
    // }

    try{

        const pageNo = Number(Request.params.pageNo);
        const perPage = Number(Request.params.perPage);
        const searchValue = Request.params.searchKeyword;

        const email = Request.headers['email'];
        const userId = new ObjectId(Request.headers['user_id']);
        const role = Request.params['role'];

        let skipRow = (pageNo - 1) * perPage;
        let data;

        if(searchValue !== "0"){

            let searchQuery = { $or: SearchArray };

            data = await DataModel.aggregate([
                { $match: { role: role } },
                { $match: searchQuery },
                { $project: Projection },
                {
                    $facet: {
                        Total: [{ $count: "count" }],
                        Rows: [{ $skip: skipRow }, { $limit: perPage }],
                    }
                }
            ]);

        }else{

            data = await DataModel.aggregate([
                { $match: { role: role } },
                { $project: Projection },
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