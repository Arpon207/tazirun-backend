import {ObjectId} from "mongodb";

export const DetailsByIdService = async (Request, DataModel) => {

    try{

        const id = new ObjectId(Request.params.id);

        let QueryObject = {};
        QueryObject['_id'] = id;

        const data = await DataModel.aggregate([
            { $match: QueryObject },
        ]);

        return { status: "success", data: data };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}