import UsersModel from "../../models/users/UsersModel.js";
import OtpModel from "../../models/users/OtpModel.js";
import SendEmail from "../../utility/EmailUtility.js";

export const UserVerifyEmailService = async (req, res) => {
    try{

        const email = req.params['email'];
        const OtpCode = Math.floor(100000 + Math.random() * 900000);

        const data = await UsersModel.aggregate([
            { $match: { email: email } },
            { $project: {  _id:0, isBanned:1 } }
        ]);

        if(data.length > 0){

            if (data[0]['isBanned'] === false){

                await OtpModel.updateOne({ email: email },{ $set: { otp: OtpCode } },{ upsert: true });

                await SendEmail(email,`Your verification code is ${OtpCode}`, "Check your verification code");

            }else{
                return{ status: 'fail', message: 'You are not authorized to reset password! Please contact with authorities!' };
            }

            return { status: 'success', message: "Otp send to your email address. Please check your email!" };
        }else {
            return{ status: 'fail', message: 'User not exist!' };
        }

    }catch (e) {
        return { status: 'error', data: e.toString() };
    }
}