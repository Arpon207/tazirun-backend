import DataModel from "../../models/subSubCategories/SubSubCategoryModel.js";
import {SubSubCategoryDropdownService} from "../../services/common/SubSubCategoryDropdownService.js";
import {ListOneJoinService} from "../../services/common/ListOneJoinService.js";
import {CheckAssociateService} from "../../services/common/CheckAssociateService.js";
import {ObjectId} from "mongodb";
import ProductsModel from "../../models/products/ProductsModel.js";
import {DetailsByIdService} from "../../services/common/DetailsByIdService.js";
import {CreateSubSubCategoryService} from "../../services/subSubCategory/CreateSubSubCategoryService.js";
import {UpdateSubSubCategoryService} from "../../services/subSubCategory/UpdateSubSubCategoryService.js";
import {SubSubCategoryDeleteService} from "../../services/subSubCategory/SubSubCategoryDeleteService.js";

// Create
export const CreateSubSubCategory = async (req, res) => {
    const result = await CreateSubSubCategoryService(req, res);
    res.json(result);
}

// Update
export const UpdateSubSubCategory = async (req, res) => {
    const result = await UpdateSubSubCategoryService(req, res);
    res.json(result);
}

// Sub Sub Category List
export const SubSubCategoryList = async (req, res) => {
    const SearchRegx = { "$regex": req.params.searchKeyword, "$options": "i" };
    const SearchArray = [{name: SearchRegx}];

    const JoinStage = { $lookup: { from: 'subcategories', localField: 'subCategoryId', foreignField: '_id', as: 'subCategoryDetails' } };

    const UnWindSubCategory = { $unwind: '$subCategoryDetails' };

    const Projection = { $project: { categoryId: 1, name: 1, image: 1, createdAt:1, 'subCategoryDetails.name': 1 } }

    const result = await ListOneJoinService(req, DataModel, SearchArray, JoinStage, UnWindSubCategory, Projection);
    res.json(result);
}

// DropDown
export const SubSubCategoryDropDown = async (req, res) => {
    const result = await SubSubCategoryDropdownService(req, DataModel, {_id: 1, name: 1});
    res.json(result);
}

// Delete
export const DeleteSubSubCategory = async (req, res) => {

    const id = new ObjectId(req.params['id']);

    let checkAssociate = await CheckAssociateService({subSubCategoryId: id}, ProductsModel);

    if(checkAssociate){
        res.status(200).json({status: "associate", message: "Can't be deleted! Associate with product!"});
    }else{
        const result = await SubSubCategoryDeleteService(req, res);
        res.json(result);
    }
}

// Details
export const SubSubCategoryDetails = async (req, res) => {
    const result = await DetailsByIdService(req, DataModel);
    res.json(result);
}





















