import DataModel from "../../models/expenses/ExpensesModel.js";
import {UpdateService} from "../../services/common/UpdateService.js";
import {DropdownService} from "../../services/common/DropDownService.js";
import {CreateWithUserService} from "../../services/common/CreateWithUserService.js";
import {DeleteService} from "../../services/common/DeleteService.js";
import {DetailsByIdService} from "../../services/common/DetailsByIdService.js";
import {ListOneJoinServiceWithoutProjection} from "../../services/common/ListOneJoinServiceWithoutProjection.js";

// Create
export const CreateExpense = async (req, res) => {
    const result = await CreateWithUserService(req, DataModel);
    res.json(result);
}

// Update
export const UpdateExpense = async (req, res) => {
    const result = await UpdateService(req, DataModel);
    res.json(result);
}

// Expense List
export const ExpenseList = async (req, res) => {
    const SearchRegx = { "$regex": req.params.searchKeyword, "$options": "i" };
    const SearchArray = [{note: SearchRegx}, {amount: SearchRegx}, {"type.name" : SearchRegx}];

    const JoinStage = { $lookup: { from: "expensetypes", localField: "typeID", foreignField: "_id", as: "type" } };

    const UnwindTypeStage = { $unwind: "$type" };

    const result = await ListOneJoinServiceWithoutProjection(req, DataModel, SearchArray, JoinStage, UnwindTypeStage);
    res.json(result);
}

// DropDown
export const ExpenseDropDown = async (req, res) => {
    const result = await DropdownService(req, DataModel, {_id: 1, name: 1});
    res.json(result);
}

// Delete
    export const DeleteExpense = async (req, res) => {
    const result = await DeleteService(req, DataModel);
    res.json(result);
}

// Details
export const ExpenseDetails = async (req, res) => {
    const result = await DetailsByIdService(req, DataModel);
    res.json(result);
}











