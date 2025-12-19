import DataModel from "../../models/brands/BrandsModel.js";
import ProductsModel from "../../models/products/ProductsModel.js";
import {DropdownService} from "../../services/common/DropDownService.js";
import {ObjectId} from "mongodb";
import {CheckAssociateService} from "../../services/common/CheckAssociateService.js";
import {DetailsByIdService} from "../../services/common/DetailsByIdService.js";
import {GetAllService} from "../../services/common/GetAllService.js";
import {CreateBrandService} from "../../services/brand/CreateBrandService.js";
import {UpdateBrandService} from "../../services/brand/UpdateBrandService.js";
import {BrandDeleteService} from "../../services/brand/BrandDeleteService.js";
import {BrandListService} from "../../services/brand/BrandListService.js";
import {clearCorruptedCache} from "../../utility/cache/cacheCleanup.js";

// Create
export const CreateBrand = async (req, res) => {
    const result = await CreateBrandService(req, res);
    res.json(result);
}

// Update
export const UpdateBrand = async (req, res) => {
    const result = await UpdateBrandService(req, res);
    res.json(result);
}

// Get All Brand
// Initialize cache cleanup on module load
(async () => {
    try {
        await clearCorruptedCache();
        console.log("✅ Brand service cache initialized successfully");
    } catch (error) {
        console.log("❌ Brand cache initialization failed:", error.message);
    }
})();

// Get All Brand - CONTROLLER
export const AllBrand = async (req, res) => {
    const result = await GetAllService(req, DataModel);
    res.json(result);
}

// Brand List
export const BrandList = async (req, res) => {
    const SearchRegx = { "$regex": req.params.searchKeyword, "$options": "i" };
    const SearchArray = [{name: SearchRegx}];
    const result = await BrandListService(req, DataModel, SearchArray);
    res.json(result);
}

// DropDown
export const BrandDropDown = async (req, res) => {
    const result = await DropdownService(req, DataModel, {_id: 1, name: 1});
    res.json(result);
}

// Delete
export const DeleteBrand = async (req, res) => {

    const id = new ObjectId(req.params['id']);

    let checkAssociate = await CheckAssociateService({brandId: id}, ProductsModel);

    if(checkAssociate){
        res.status(200).json({status: "associate", message: "Can't be deleted! Associate with product!"});
    }else{
        const result = await BrandDeleteService(req, res);
        res.json(result);
    }
}

// Details
export const BrandDetails = async (req, res) => {
    const result = await DetailsByIdService(req, DataModel);
    res.json(result);
}















