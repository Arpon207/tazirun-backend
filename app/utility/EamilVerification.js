import nodemailer from 'nodemailer';
import {EMAIL_PASS, EMAIL_USER} from "../config/config.js";

const EamilVerification = async (EmailTo, EmailText, EmailSubject) => {

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: "Tajir Super Shop <atikurrahmanjabed@gmail.com>",
        to: EmailTo,
        subject: EmailSubject,
        text: EmailText,
    }

    return await transporter.sendMail(mailOptions);

}

export default EamilVerification;