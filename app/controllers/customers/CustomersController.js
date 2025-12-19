import DataModel from "../../models/customers/CustomersModel.js";
import SalesModel from "../../models/sales/SalesModel.js";
import {CreateWithUniqueService} from "../../services/common/CreateWithUniqueService.js";
import {UpdateService} from "../../services/common/UpdateService.js";
import {DropdownService} from "../../services/common/DropDownService.js";
import {ObjectId} from "mongodb";
import {CheckAssociateService} from "../../services/common/CheckAssociateService.js";
import {DeleteService} from "../../services/common/DeleteService.js";
import {DetailsByIdService} from "../../services/common/DetailsByIdService.js";
import {CustomerListService} from "../../services/customer/CustomerListService.js";

// Create
export const CreateCustomer = async (req, res) => {
    const result = await CreateWithUniqueService(req, DataModel);
    res.json(result);
}

// Update
export const UpdateCustomer = async (req, res) => {
    const result = await UpdateService(req, DataModel);
    res.json(result);
}

// Customer List
export const CustomerList = async (req, res) => {
    const SearchRegx = { "$regex": req.params.searchKeyword, "$options": "i" };
    const SearchArray = [{name: SearchRegx}, {phone: SearchRegx}, {address: SearchRegx}];
    const result = await CustomerListService(req, DataModel, SearchArray);
    res.json(result);
}

// DropDown
export const CustomerDropDown = async (req, res) => {
    const result = await DropdownService(req, DataModel, {_id: 1, name: 1});
    res.json(result);
}

// Region DropDown
export const CustomerRegionDropDown = async (req, res) => {
    const result = await DropdownService(req, DataModel, {_id: 1, region: 1});
    res.json(result);
}

// Thana DropDown
export const CustomerThanaDropDown = async (req, res) => {
    const result = await DropdownService(req, DataModel, {_id: 1, thana: 1});
    res.json(result);
}

// District DropDown
export const CustomerDistrictDropDown = async (req, res) => {
    const result = await DropdownService(req, DataModel, {_id: 1, district: 1});
    res.json(result);
}

// Division DropDown
export const CustomerDivisionDropDown = async (req, res) => {
    const result = await DropdownService(req, DataModel, {_id: 1, division: 1});
    res.json(result);
}

// Delete
export const DeleteCustomer = async (req, res) => {

    const id = new ObjectId(req.params['id']);

    let checkAssociate = await CheckAssociateService({customerId: id}, SalesModel);

    if(checkAssociate){
        res.status(200).json({status: "associate", message: "Can't be deleted! Associate with sales!"});
    }else{
        const result = await DeleteService(req, DataModel);
        res.json(result);
    }
}

// Details
export const CustomerDetails = async (req, res) => {
    const result = await DetailsByIdService(req, DataModel);
    res.json(result);
}