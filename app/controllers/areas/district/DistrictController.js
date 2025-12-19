import DataModel from "../../../models/Areas/district/DistrictsModel.js";
import {CreateWithUniqueService} from "../../../services/common/CreateWithUniqueService.js";
import {DetailsByIdService} from "../../../services/common/DetailsByIdService.js";
import {UpdateService} from "../../../services/common/UpdateService.js";
import {DropdownService} from "../../../services/common/DropDownService.js";
import {ObjectId} from "mongodb";
import {CheckAssociateService} from "../../../services/common/CheckAssociateService.js";
import ReturnsProductModel from "../../../models/returns/ReturunsProductModel.js";
import SalesModel from "../../../models/sales/SalesModel.js";
import {DeleteService} from "../../../services/common/DeleteService.js";
import {AreaListService} from "../../../services/areas/AreaListService.js";

// Create
export const CreateDistrict = async (req, res) => {
    const result = await CreateWithUniqueService(req, DataModel);
    res.json(result);
}

// Update
export const UpdateDistrict = async (req, res) => {
    const result = await UpdateService(req, DataModel);
    res.json(result);
}

// District List
export const DistrictList = async (req, res) => {
    const SearchRegx = { "$regex": req.params.searchKeyword, "$options": "i" };
    const SearchArray = [{name: SearchRegx}];
    const result = await AreaListService(req, DataModel, SearchArray);
    res.json(result);
}

// Details
export const DistrictDetails = async (req, res) => {
    const result = await DetailsByIdService(req, DataModel);
    res.json(result);
}

// DropDown
export const DistrictDropDown = async (req, res) => {
    const result = await DropdownService(req, DataModel, {_id: 1, name: 1});
    res.json(result);
}

// Delete
export const DistrictDelete = async (req, res) => {

    const id = new ObjectId(req.params['id']);

    const checkReturnAssociate = await CheckAssociateService({districtId: id}, ReturnsProductModel);
    const checkSalesAssociate = await CheckAssociateService({districtId: id}, SalesModel);

    if(checkReturnAssociate){
        res.status(200).json({status: "associate", message: "Associate with Return!"});
    }else if(checkSalesAssociate){
        res.status(200).json({status: "associate", message: "Associate with Sale!"});
    }else{
        const result = await DeleteService(req, DataModel);
        res.json(result);
    }

}