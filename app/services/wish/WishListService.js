import {ObjectId} from "mongodb";
import WishModel from "../../models/wish/WishModel.js";

export const WishListService = async (req) => {
    try {

        let userId = new ObjectId(req.headers['user_id'])
        let matchStage={$match:{userId:userId}}

        let JoinStageProduct = {$lookup: {from:"products", localField:"productId", foreignField:"_id", as:"products"}}
        let unwindProductStage = {$unwind:"$products"}

        // let JoinStageBrand = {$lookup : {from:"brands", localField:"products.brandId", foreignField:"_id", as:"brands"}}
        // let unwindBrandStage = {$unwind:"$brands"};
        //
        // let JoinStageCategory = {$lookup:{from:"categories", localField:"products.categoryId", foreignField:"_id", as:"categories"}}
        // let unwindCategoryStage = {$unwind:"$categories"};
        //
        // let JoinStageSubCategory = {$lookup:{from:"subcategories", localField:"products.subCategoryId", foreignField:"_id", as:"subcategories"}}
        // let unwindSubCategoryStage = {$unwind:"$subcategories"};
        //
        // let JoinStageSubSubCategory = {$lookup:{from:"subsubcategories", localField:"products.subSubCategoryId", foreignField:"_id", as:"subsubcategories"}}
        // let unwindSubSubCategoryStage = {$unwind:"$subsubcategories"};

        let projectionStage={
            $project:{
                'userId':0, 'productId':0, 'createAt':0,'updatedAt':0, 'product._id':0,
            }
        }

        let data = await WishModel.aggregate([
            matchStage,
            JoinStageProduct,
            unwindProductStage,
            // JoinStageBrand,
            // unwindBrandStage,
            // JoinStageCategory,
            // unwindCategoryStage,
            // JoinStageSubCategory,
            // unwindSubCategoryStage,
            // JoinStageSubSubCategory,
            // unwindSubSubCategoryStage,
            projectionStage
        ])

        let totalCount = await WishModel.countDocuments({ userId });

        return {status:"success", message: "Request Successful!",  total: totalCount, data:data}

    }catch (e) {
        return {status:"fail",message:"Something Went Wrong !"}
    }
}