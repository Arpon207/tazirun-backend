import { ObjectId } from "mongodb";

export const UserDeleteService = async (req, DataModel) => {
    try {
        const requesterRole = req.headers["role"]; // Role of the logged-in user
        const targetUserId = new ObjectId(req.params["id"]); // ID of the user to delete

        const targetUser = await DataModel.findOne({ _id: targetUserId });
        if (!targetUser) {
            return { status: "fail", message: "User not found!" };
        }

        // Rule 1: Normal user cannot delete anyone
        if (requesterRole !== "admin" && requesterRole !== "superadmin") {
            return { status: "fail", message: "You are not authorized to delete users!" };
        }

        // Rule 2: No one can delete a superadmin
        if (targetUser.role === "superadmin") {
            return { status: "fail", message: "Superadmin cannot be deleted!" };
        }

        // Rule 3: Admin cannot delete another admin
        if (requesterRole === "admin" && targetUser.role === "admin") {
            return { status: "fail", message: "Admin cannot delete another admin!" };
        }

        // ✅ Passed all checks → delete user
        await DataModel.deleteOne({ _id: targetUserId });

        return { status: "success", message: "User deleted successfully!" };
    } catch (e) {
        return { status: "fail", data: e.toString() };
    }
};
