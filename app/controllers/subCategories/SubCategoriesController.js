import DataModel from "../../models/subCategories/SubCategoryModel.js";
import {CreateWithUniqueService} from "../../services/common/CreateWithUniqueService.js";
import {SubCategoryDropdownService} from "../../services/common/SubCategoryDropdownService.js";
import {UpdateService} from "../../services/common/UpdateService.js";
import {ObjectId} from "mongodb";
import {CheckAssociateService} from "../../services/common/CheckAssociateService.js";
import ProductsModel from "../../models/products/ProductsModel.js";
import {DeleteService} from "../../services/common/DeleteService.js";
import {DetailsByIdService} from "../../services/common/DetailsByIdService.js";
import {ListOneJoinService} from "../../services/common/ListOneJoinService.js";
import {DropdownService} from "../../services/common/DropDownService.js";
import {CreateSubCategoryService} from "../../services/subCategory/CreateSubCategoryService.js";
import {UpdateSubCategoryService} from "../../services/subCategory/UpdateSubCategoryService.js";
import {SubCategoryDeleteService} from "../../services/subCategory/SubCategoryDeleteService.js";

// Create
export const CreateSubCategory = async (req, res) => {
    const result = await CreateSubCategoryService(req, res);
    res.json(result);
}

// Update
export const UpdateSubCategory = async (req, res) => {
    const result = await UpdateSubCategoryService(req, res);
    res.json(result);
}

// Sub Category List
export const SubCategoryList = async (req, res) => {
    const SearchRegx = { "$regex": req.params.searchKeyword, "$options": "i" };
    const SearchArray = [{name: SearchRegx}];

    const JoinStage = { $lookup: { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'categoryDetails' } };

    const UnWindSubCategory = { $unwind: '$categoryDetails' };

    const Projection = { $project: { categoryId: 1, name: 1, image: 1, createdAt:1, 'categoryDetails.name': 1 } }

    const result = await ListOneJoinService(req, DataModel, SearchArray, JoinStage, UnWindSubCategory, Projection);
    res.json(result);
}

// DropDown By Id
export const SubCategoryDropDown = async (req, res) => {
    const result = await SubCategoryDropdownService(req, DataModel, {_id: 1, name: 1});
    res.json(result);
}

// DropDown
export const OnlySubCategoryDropDown = async (req, res) => {
    const result = await DropdownService(req, DataModel, {_id: 1, name: 1});
    res.json(result);
}

// Delete
export const DeleteSubCategory = async (req, res) => {

    const id = new ObjectId(req.params['id']);

    let checkAssociate = await CheckAssociateService({subCategoryId: id}, ProductsModel);

    if(checkAssociate){
        res.status(200).json({status: "associate", message: "Can't be deleted! Associate with product!"});
    }else{
        const result = await SubCategoryDeleteService(req, res);
        res.json(result);
    }
}

// Details
export const SubCategoryDetails = async (req, res) => {
    const result = await DetailsByIdService(req, DataModel);
    res.json(result);
}






















