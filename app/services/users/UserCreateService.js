import bcrypt from 'bcrypt';
import UsersModel from "../../models/users/UsersModel.js";

const UserCreateService = async (req) =>{
    try{

        const reqBody = req.body;
        const { email, password } = reqBody;
        const EncryptedPassword = await bcrypt.hash(password, 10);
        reqBody.password = EncryptedPassword;

        const isUserExist = await UsersModel.findOne({email});

        if(isUserExist){
            return{ status: 'fail', message: 'User already exist!' };
        }else{

            const data = await UsersModel.create(reqBody);

            return{ status: 'success', message: 'Registration completed successfully!' };
        }

    }catch (e) {
        return { status: 'fail', message: 'An error occurred during registration.' };
    }
}

export default UserCreateService;