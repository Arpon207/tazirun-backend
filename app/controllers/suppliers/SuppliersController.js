import DataModel from "../../models/suppliers/SuppliersModel.js";
import PurchasesModel from "../../models/purchases/PurchasesModel.js";
import {CreateWithUniqueService} from "../../services/common/CreateWithUniqueService.js";
import {UpdateService} from "../../services/common/UpdateService.js";
import {DropdownService} from "../../services/common/DropDownService.js";
import {ObjectId} from "mongodb";
import {CheckAssociateService} from "../../services/common/CheckAssociateService.js";
import {DeleteService} from "../../services/common/DeleteService.js";
import {DetailsByIdService} from "../../services/common/DetailsByIdService.js";
import {ExpenseListService} from "../../services/expenses/ExpenseListService.js";

// Create
export const CreateSupplier = async (req, res) => {
    const result = await CreateWithUniqueService(req, DataModel);
    res.json(result);
}

// Update
export const UpdateSupplier = async (req, res) => {
    const result = await UpdateService(req, DataModel);
    res.json(result);
}

// Supplier List
export const SupplierList = async (req, res) => {
    const SearchRegx = { "$regex": req.params.searchKeyword, "$options": "i" };
    const SearchArray = [{name: SearchRegx}, {phone: SearchRegx}, {address: SearchRegx}];
    const result = await ExpenseListService(req, DataModel, SearchArray);
    res.json(result);
}

// DropDown
export const SupplierDropDown = async (req, res) => {
    const result = await DropdownService(req, DataModel, {_id: 1, name: 1});
    res.json(result);
}

// Delete
export const DeleteSupplier = async (req, res) => {

    const id = new ObjectId(req.params['id']);

    let checkAssociate = await CheckAssociateService({brandId: id}, PurchasesModel);

    if(checkAssociate){
        res.status(200).json({status: "associate", message: "Can't be deleted! Associate with purchase!"});
    }else{
        const result = await DeleteService(req, DataModel);
        res.json(result);
    }
}

// Details
export const SupplierDetails = async (req, res) => {
    const result = await DetailsByIdService(req, DataModel);
    res.json(result);
}