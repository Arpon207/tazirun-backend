import {CreateParentChildService} from "../../services/common/CreateParentChildService.js";
import ParentModel from "../../models/purchases/PurchasesModel.js";
import ChildModel from "../../models/purchases/PurchasesProductModel.js";
import {DeleteParentChildService} from "../../services/common/DeleteParentChildService.js";
import {ListTwoJoinServiceWithoutProjection} from "../../services/common/ListTwoJoinServiceWithoutProjection.js";

// Create
export const CreatePurchase = async (req, res) => {
    const result = await CreateParentChildService(req, ParentModel, ChildModel, "purchaseId" );
    res.json(result);
}

// Purchase List
export const PurchaseList = async (req, res) => {
    const SearchRegx = { "$regex": req.params.searchKeyword, "$options": "i" };
    const SearchArray = [{note : SearchRegx}, {"suppliers.name" : SearchRegx}, {"suppliers.address" : SearchRegx}, {"suppliers.phone" : SearchRegx}, {"suppliers.email" : SearchRegx}];

    const JoinStage1 = { $lookup: { from: "suppliers", localField: "supplierId", foreignField: "_id", as: "suppliers" } };
    const JoinStage2 = { $lookup: { from: "products", localField: "productId", foreignField: "_id", as: "products" } };

    const UnwindBrandStage1 = { $unwind: "$suppliers" };
    const UnwindBrandStage2 = { $unwind: "$products" };

    const result = await ListTwoJoinServiceWithoutProjection(req, ParentModel, SearchArray, JoinStage1, JoinStage2, UnwindBrandStage1, UnwindBrandStage2  );
    res.json(result);
}

// Delete
export const DeletePurchase = async (req, res) => {
    const result = await DeleteParentChildService(req, ParentModel, ChildModel, "purchaseId" );
    res.json(result);
}