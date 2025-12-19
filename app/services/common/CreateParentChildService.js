import mongoose from "mongoose";

export const CreateParentChildService = async (Request, ParentModel, ChildModel, JoinPropertyName) => {
    // Start Transaction Session
    const session = await mongoose.startSession();

    try {
        await session.startTransaction();

        // First Database Process - Create Parent
        const parent = Request.body['parent'];
        parent.email = Request.headers['email'];

        const parentCreation = await ParentModel.create([parent], { session });

        // Validate and Prepare Child Documents
        let childs = Request.body['childs'];

        if (!Array.isArray(childs) || childs.length === 0) {
            throw new Error("Child data is missing or not an array");
        }

        // Ensure parent ID is properly assigned to each child
        for (const element of childs) {
            element[JoinPropertyName] = parentCreation[0]['_id']; // parentCreation is an array
            element['email'] = Request.headers['email'];
        }

        // Insert Child Documents
        let childCreation = await ChildModel.insertMany(childs, { session });

        // Commit Transaction
        await session.commitTransaction();
        session.endSession();

        return { status: "success", parent: parentCreation, childs: childCreation };

    } catch (e) {
        // Rollback Transaction on Error
        await session.abortTransaction();
        session.endSession();
        return { status: "fail", data: e.toString() };
    }
};
