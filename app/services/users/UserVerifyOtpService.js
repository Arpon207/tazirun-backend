import OtpModel from "../../models/users/OtpModel.js";

export const UserVerifyOtpService = async (req, res) => {
    try{

        const email = req.params['email'];
        const otp = req.params['otp'];
        const status = 0;
        const statusUpdate = 1;

        const userCount = await OtpModel.aggregate([
            { $match: { email: email, otp: otp, status: status } },
            { $count: "total" }
        ]);

        if(userCount.length > 0){

            await OtpModel.updateOne({email: email, otp: otp, status: status},{status:statusUpdate});
            return { status: 'success', message: "Otp verified successfully!" };

        }else{
            return { status: 'fail', message: "Invalid email or OTP!" };
        }

    }catch (e) {
        return { status: 'error', data: e.toString() }
    }
}