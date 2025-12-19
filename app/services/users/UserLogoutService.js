import UsersModel from "../../models/users/UsersModel.js";
import {ObjectId} from "mongodb";

const UserLogoutService = async (req, res) =>{
    try{

        const userId = new ObjectId(req.headers['user_id']);


        return{ status: 'success', message: 'Logout completed successfully!' };

    }catch (e) {
        return { status: 'fail', message: 'An error occurred during registration.' };
    }
}

export default UserLogoutService;