import {ObjectId} from "mongodb";
import bcrypt from "bcrypt";
import UsersModel from "../../models/users/UsersModel.js";

export const UserUpdateService = async (req, res) => {
    try {
        const userId = new ObjectId(req.headers["user_id"]);

        // Get the current user data first
        const currentUser = await UsersModel.findById(userId);
        if (!currentUser) {
            return {
                status: "error",
                message: "User not found"
            };
        }

        // Initialize variables
        let updateData = {};

        // Handle other fields update
        const fields = ['firstName', 'lastName', 'email', 'mobile', 'password'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Handle password encryption if provided
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        // Update user in database
        const result = await UsersModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        );

        return {
            status: "success",
            message: "Profile updated successfully",
            data: result
        };

    } catch (e) {
        return {
            status: "error",
            message: e.message
        }
    }
};