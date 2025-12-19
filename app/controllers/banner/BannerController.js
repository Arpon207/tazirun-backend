import DataModel from "../../models/banner/BannerModel.js";
import {DetailsByIdService} from "../../services/common/DetailsByIdService.js";
import {GetAllService} from "../../services/common/GetAllService.js";
import {CreateBannerService} from "../../services/banner/CreateBrandService.js";
import {UpdateBannerService} from "../../services/banner/UpdateBannerService.js";
import {BannerDeleteService} from "../../services/banner/BannerDeleteService.js";
import {BannerListService} from "../../services/banner/BannerListService.js";

// Create
export const CreateBanner = async (req, res) => {
    const result = await CreateBannerService(req, res);
    res.json(result);
}

// Update
export const UpdateBanner = async (req, res) => {
    const result = await UpdateBannerService(req, res);
    res.json(result);
}

// Get All Banner
export const AllBanner = async (req, res) => {
    const result = await GetAllService(req, DataModel);
    res.json(result);
}

// Banner List
export const BannerList = async (req, res) => {
    const result = await BannerListService(req, DataModel);
    res.json(result);
}


// Delete
export const DeleteBanner = async (req, res) => {
    const result = await BannerDeleteService(req, res);
    res.json(result);
}

// Details
export const BannerDetails = async (req, res) => {
    const result = await DetailsByIdService(req, DataModel);
    res.json(result);
}















