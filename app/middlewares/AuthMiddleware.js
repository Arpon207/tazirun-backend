// AuthMiddleware.js
import { TokenDecode } from "../utility/TokenUtility.js";
import UsersModel from "../models/users/UsersModel.js";

export default async (req, res, next) => {

    const token = req.headers["token"]; // <-- FIXED

    if (!token) {
        return res.status(401).json({ status: "fail", message: "No token provided" });
    }

    const decoded = await TokenDecode(token);

    if (decoded === null) {
        return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const { email, user_id, isBanned, role } = decoded;

    const isUserExist = await UsersModel.findById(user_id);

    if (!isUserExist) {
        return res.status(404).json({ status: "fail", message: "User not found" });
    }

    if (isUserExist.isBanned === true) {
        return res.status(403).json({ status: "fail", message: "You are banned!" });
    }

    req.headers.email = email;
    req.headers.user_id = user_id;
    req.headers.isBanned = isBanned;
    req.headers.role = role;

    next();
};
