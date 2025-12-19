import {ObjectId} from "mongodb";
import DataModel from "../../models/subCategories/SubCategoryModel.js";

export const SubCategoryDetailsById = async (req, res) => {

    try{

        const id = new ObjectId(req.params.id);

        let QueryObject = {};
        QueryObject['_id'] = id;

        const JoinStage = { $lookup: { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'categoryDetails' } };

        const UnWindSubCategory = { $unwind: '$categoryDetails' };

        const Projection = { $project: { categoryId: 1, name: 1, image: 1, 'categoryDetails.name': 1 } }

        const data = await DataModel.aggregate([
            { $match: QueryObject },
            JoinStage,
            UnWindSubCategory,
            Projection

        ]);

        return { status: "success", data: data };

    }catch (e) {
        return { status: "fail", data: e.toString() };
    }

}