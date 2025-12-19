import DataModel from "../../models/productVariant/ProductVariantModel.js";
import {ListService} from "../../services/common/ListService.js";
import {ObjectId} from "mongodb";
import {CreateProductVariantService} from "../../services/productVariant/CreateProductVariantService.js";
import {GetAllVariantDetails} from "../../services/productVariant/GetAllVariantDetails.js";
import {UpdateProductVariantService} from "../../services/productVariant/UpdateProductVariantService.js";
import {DeleteVariantService} from "../../services/productVariant/DeleteVariantService.js";

// Create
export const CreateProductVariant = async (req, res) => {
    const result = await CreateProductVariantService(req, res);
    res.json(result);
}

// Update
export const UpdateProductVariant = async (req, res) => {
    const result = await UpdateProductVariantService(req, res);
    res.json(result);
}

// Get All Product Variant
export const AllVariantDetails = async (req, res) => {

    const id = new ObjectId(req.params['id']);
    const MatchQuery = { productId: id };

    const result = await GetAllVariantDetails(req, DataModel, MatchQuery);
    res.json(result);
}

// Product Variant List
export const ProductVariantList = async (req, res) => {
    const SearchRegx = { "$regex": req.params.searchKeyword, "$options": "i" };
    const SearchArray = [{name: SearchRegx}];

    const JoinStage1 = { $lookup: { from: "products", localField: "productId", foreignField: "_id", as: "products" } };

    const UnwindBrandStage1 = { $unwind: "$products" };

    const Projection = { $project: { 'products.campaignId': 0, 'products.price': 0, 'products.discount': 0, 'products.discountPrice': 0, 'products.stock': 0, 'products.remark': 0, 'products.specification': 0, 'products.image': 0, 'products.unit': 0, 'products.brandId': 0, 'products.categoryId': 0, 'products.subCategoryId': 0, 'products.subSubCategoryId': 0, 'products.details': 0, 'products.createdAt': 0, 'products.updatedAt': 0 } }


    const result = await ListService(req, DataModel, SearchArray, JoinStage1, UnwindBrandStage1, Projection);
    res.json(result);
}


// Delete
export const DeleteVariant = async (req, res) => {
    const result = await DeleteVariantService(req, res);
    res.json(result);
}

















