import DataModel from "../../models/marketeingCampaign/MarketingCampaignModel.js";
import ProductsModel from "../../models/products/ProductsModel.js";
import {ListService} from "../../services/common/ListService.js";
import {ObjectId} from "mongodb";
import {CheckAssociateService} from "../../services/common/CheckAssociateService.js";
import {DetailsByIdService} from "../../services/common/DetailsByIdService.js";
import {GetAllService} from "../../services/common/GetAllService.js";
import {BrandDeleteService} from "../../services/brand/BrandDeleteService.js";
import {CreateMarketingCampaignService} from "../../services/marketingCampaign/CreateMarketingCampaignService.js";
import {UpdateMarketingCampaignService} from "../../services/marketingCampaign/UpdateMarketingCampaignService.js";
import {MarketingCampaignListService} from "../../services/marketingCampaign/MarketingCampaignListService.js";
import {CampaignByIdService} from "../../services/marketingCampaign/CampaignByIdService.js";
import {DeleteCampaignService} from "../../services/marketingCampaign/DeleteCampaignService.js";
import {AllCampaignService} from "../../services/marketingCampaign/AllCampaignService.js";
import {DropdownService} from "../../services/common/DropDownService.js";
import {clearCorruptedCache} from "../../utility/cache/cacheCleanup.js";

// Create
export const CreateCampaign = async (req, res) => {
    const result = await CreateMarketingCampaignService(req, res);
    res.json(result);
}

// Update
export const UpdateCampaign = async (req, res) => {
    const result = await UpdateMarketingCampaignService(req, res);
    res.json(result);
}

// Get All Campaign
// Initialize cache cleanup on module load
(async () => {
    try {
        await clearCorruptedCache();
        console.log("✅ All campaign service cache initialized successfully");
    } catch (error) {
        console.log("❌ Campaign cache initialization failed:", error.message);
    }
})();

// Get All Campaign - CONTROLLER
export const AllCampaign = async (req, res) => {
    const result = await AllCampaignService(req, DataModel);
    res.json(result);
}

// DropDown
export const CampaignDropDown = async (req, res) => {
    const result = await DropdownService(req, DataModel, {_id: 1, title: 1});
    res.json(result);
}

// Campaign List
export const CampaignList = async (req, res) => {
    const SearchRegx = { "$regex": req.params.searchKeyword, "$options": "i" };
    const SearchArray = [{name: SearchRegx}];

    const JoinStage1 = { $lookup: { from: "brands", localField: "brandId", foreignField: "_id", as: "brands" } };
    const JoinStage2 = { $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categories" } };

    const UnwindBrandStage = { $unwind: "$brands" };
    const UnwindCategoryStage = { $unwind: "$categories" };

    const result = await MarketingCampaignListService(req, DataModel, SearchArray, JoinStage1, JoinStage2, UnwindBrandStage, UnwindCategoryStage);
    res.json(result);
}

// Campaign By ID
export const CampaignById = async (req, res) => {
    const id = new ObjectId(req.params['id']);
    const MatchQuery = { _id: id };

    const JoinStage1 = { $lookup: { from: "brands", localField: "brandId", foreignField: "_id", as: "brands" } };
    const JoinStage2 = { $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categories" } };

    const UnwindBrandStage = { $unwind: "$brands" };
    const UnwindCategoryStage = { $unwind: "$categories" };

    const Projection = { $project: { createdAt: 0, updatedAt: 0, 'brands.image': 0, 'brands.createdAt': 0, 'brands.updatedAt': 0, 'categories.image': 0, 'categories.createdAt': 0, 'categories.updatedAt': 0, } }

    const result = await CampaignByIdService(req, DataModel, MatchQuery, JoinStage1, JoinStage2, UnwindBrandStage, UnwindCategoryStage, Projection);
    res.json(result);
}

// Delete
export const DeleteCampaign = async (req, res) => {
    const result = await DeleteCampaignService(req, res);
    res.json(result);
}















