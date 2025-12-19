import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export const DeleteParentChildService = async (Request, ParentModel, ChildModel, JoinPropertyName) => {
    const session = await mongoose.startSession();

    try {
        await session.startTransaction();

        const deleteId = new ObjectId(Request.params['id']);

        // Create simple query objects using only the ID
        const childQueryObject = {
            [JoinPropertyName]: deleteId
        };

        const parentQueryObject = {
            _id: deleteId
        };

        // First Database Process - Delete Child Documents
        const childDelete = await ChildModel.deleteMany(childQueryObject, { session });

        // Second Database Process - Delete Parent Document
        const parentDelete = await ParentModel.deleteOne(parentQueryObject, { session });

        // Commit Transaction
        await session.commitTransaction();
        session.endSession();

        return {
            status: "success",
            parent: parentDelete,
            childs: childDelete
        };

    } catch (e) {
        // Rollback Transaction on Error
        await session.abortTransaction();
        session.endSession();
        return {
            status: "fail",
            data: e.toString()
        };
    }
};