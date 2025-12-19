import DataModel from "../../models/expenses/ExpensesTypeModel.js";
import ExpensesModel from "../../models/expenses/ExpensesModel.js";
import {UpdateService} from "../../services/common/UpdateService.js";
import {DropdownService} from "../../services/common/DropDownService.js";
import {CreateWithUserService} from "../../services/common/CreateWithUserService.js";
import {DetailsByIdService} from "../../services/common/DetailsByIdService.js";
import {ObjectId} from "mongodb";
import {CheckAssociateService} from "../../services/common/CheckAssociateService.js";
import {DeleteService} from "../../services/common/DeleteService.js";
import {ExpenseListService} from "../../services/expenses/ExpenseListService.js";

// Create
export const CreateExpenseType = async (req, res) => {
    const result = await CreateWithUserService(req, DataModel);
    res.json(result);
}

// Update
export const UpdateExpenseType = async (req, res) => {
    const result = await UpdateService(req, DataModel);
    res.json(result);
}

// Expense List
export const ExpenseTypeList = async (req, res) => {
    const SearchRegx = { "$regex": req.params.searchKeyword, "$options": "i" };
    const SearchArray = [{name: SearchRegx}];
    const result = await ExpenseListService(req, DataModel, SearchArray);
    res.json(result);
}

// DropDown
export const ExpenseTypeDropDown = async (req, res) => {
    const result = await DropdownService(req, DataModel, {_id: 1, name: 1});
    res.json(result);
}

// Details
export const ExpenseTypeDetails = async (req, res) => {
    const result = await DetailsByIdService(req, DataModel);
    res.json(result);
}

// Delete
export const ExpenseTypeDelete = async (req, res) => {

    const id = new ObjectId(req.params['id']);

    let checkAssociate = await CheckAssociateService({typeID: id}, ExpensesModel);

    if(checkAssociate){
        res.status(200).json({status: "associate", message: "Can't be deleted! Associate with expense!"});
    }else{
        const result = await DeleteService(req, DataModel);
        res.json(result);
    }
}