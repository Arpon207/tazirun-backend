import jwt from 'jsonwebtoken';
import {JWT_EXPIRE_TIME, JWT_KEY} from "../config/config.js";

// Token Encode
export const TokenEncode = (user_id, email, isBanned, user_role) => {

    const KEY = JWT_KEY;
    const EXPIRE = { expiresIn: JWT_EXPIRE_TIME };
    const PAYLOAD = { user_id: user_id, email: email, isBanned: isBanned, role: user_role };
    return jwt.sign(PAYLOAD, KEY, EXPIRE);

}

// Token Decode
export const TokenDecode = (token) => {

    try {
        return jwt.verify(token, JWT_KEY);
    }catch (err) {
        return null;
    }

}
