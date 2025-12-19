import {ObjectId} from "mongodb";

export const SubCategoryDropdownService = async (Request, DataModel, Projection) => {

    try{

        const id = new ObjectId(Request.params['id']);

        const data = await DataModel.aggregate([
            { $match: { categoryId: id } },
            { $project: Projection }
        ]);

        return { status: "success", data: data };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}