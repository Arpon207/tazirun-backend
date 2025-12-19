import {CreateParentChildService} from "../../services/common/CreateParentChildService.js";
import ParentModel from "../../models/returns/ReturnsModel.js";
import ChildModel from "../../models/returns/ReturunsProductModel.js";
import {DeleteParentChildService} from "../../services/common/DeleteParentChildService.js";
import {ListTwoJoinServiceWithoutProjection} from "../../services/common/ListTwoJoinServiceWithoutProjection.js";

// Create
export const CreateReturn = async (req, res) => {
    const result = await CreateParentChildService(req, ParentModel, ChildModel, "returnId" );
    res.json(result);
}

// Return List
export const ReturnList = async (req, res) => {
    const SearchRegx = { "$regex": req.params.searchKeyword, "$options": "i" };
    const SearchArray = [{note : SearchRegx}, {"customers.name" : SearchRegx}, {"customers.address" : SearchRegx}, {"customers.phone" : SearchRegx}, {"customers.email" : SearchRegx}];

    const JoinStage1 = { $lookup: { from: "customers", localField: "customerId", foreignField: "_id", as: "customers" } };
    const JoinStage2 = { $lookup: { from: "products", localField: "productId", foreignField: "_id", as: "products" } };

    const UnwindBrandStage1 = { $unwind: "$customers" };
    const UnwindBrandStage2 = { $unwind: "$products" };

    const result = await ListTwoJoinServiceWithoutProjection(req, ParentModel, SearchArray, JoinStage1, JoinStage2, UnwindBrandStage1, UnwindBrandStage2 );
    res.json(result);
}

// Delete
export const DeleteReturn = async (req, res) => {
    const result = await DeleteParentChildService(req, ParentModel, ChildModel, "returnId" );
    res.json(result);
}