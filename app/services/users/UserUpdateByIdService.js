import { ObjectId } from "mongodb";
import UsersModel from "../../models/users/UsersModel.js";

export const UserUpdateByIdService = async (req, res) => {
    try {
        const userRole = req.headers['role']; // Role of the logged-in user
        const userId = new ObjectId(req.params['id']); // ID of the user to be updated
        const { isBanned, role } = req.body; // Fields from request body

        const targetUser = await UsersModel.findOne({ _id: userId });

        if (!targetUser) {
            return { status: "fail", message: "User not found!" };
        }

        // Only "admin" or "superadmin" can perform updates
        if (userRole !== "admin" && userRole !== "superadmin") {
            return { status: "fail", message: "You are not authorized!" };
        }

        // Admin cannot modify another admin's role or isBanned status
        if (userRole === "admin" && targetUser.role === "admin") {
            return { status: "fail", message: "An admin cannot modify another admin!" };
        }

        // Only superadmin can change admin's role or isBanned status
        if (targetUser.role === "admin" && userRole !== "superadmin") {
            return { status: "fail", message: "Only superadmin can modify an admin!" };
        }

        // Admin and Superadmin can change roles and isBanned for other roles
        const updateData = {};
        if (isBanned !== undefined) updateData.isBanned = isBanned;
        if (role && userRole === "superadmin") updateData.role = role;
        if (role && userRole === "admin" && targetUser.role !== "admin") updateData.role = role;

        const data = await UsersModel.updateOne({ _id: userId }, { $set: updateData });

        return { status: "success", message: "User updated successfully!", data };
    } catch (e) {
        return res.json({ status: "error", message: e.toString() });
    }
};