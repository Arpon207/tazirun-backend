import nodemailer from 'nodemailer';
import {EMAIL_HOST, EMAIL_PASS, EMAIL_PORT, EMAIL_SECURITY, EMAIL_USER} from "../config/config.js";

const SendEmail = async (EmailTo, EmailText, EmailSubject) => {

    const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: EMAIL_SECURITY,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        }
    });

    const mailOptions = {
        from: "Tajir Super Shop <atikurrahmanjabed@gmail.com>",
        to: EmailTo,
        subject: EmailSubject,
        text: EmailText,
    }

    return await transporter.sendMail(mailOptions);

}

export default SendEmail;