// services/users/UserLoginService.js
import bcrypt from 'bcrypt';
import { TokenEncode } from "../../utility/TokenUtility.js";
import UsersModel from "../../models/users/UsersModel.js";
import { MigrateCartService } from "../cart/MigrateCartService.js";

const UserLoginService = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 🔥 OPTIMIZATION: Early validation
        if (!email || !password) {
            return { status: 'fail', message: 'Email and password are required!' };
        }

        // 🔥 OPTIMIZATION: Use findOne with select instead of aggregate for single document
        const user = await UsersModel.findOne({ email: email.toLowerCase().trim() })
            .select('_id email password firstName lastName mobile photo role isBanned createdAt')
            .lean(); // Use lean for better performance - returns plain JS object

        if (!user) {
            return { status: 'fail', message: 'User not exist!' };
        }

        // 🔥 OPTIMIZATION: Check banned status before password comparison (save CPU)
        if (user.isBanned) {
            return { status: 'fail', message: 'You are not authorized to login!' };
        }

        const MatchingPassword = await bcrypt.compare(password, user.password);
        if (!MatchingPassword) {
            return { status: 'fail', message: 'Credential Incorrect!' };
        }

        const userId = user._id.toString();

        // 🔥 OPTIMIZATION: Non-blocking cart migration (don't block login response)
        if (req.cookies?.guestId) {
            migrateCartNonBlocking(userId, req.cookies.guestId);
        }

        const userDetails = {
            id: userId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            mobile: user.mobile,
            role: user.role
        };

        console.log('back', userDetails);

        // 🔥 OPTIMIZATION: Generate token in parallel with other operations
        const [token] = await Promise.all([
            TokenEncode(user._id, user.email, user.isBanned, user.role)
        ]);

        return {
            status: 'success',
            message: 'Login completed successfully!',
            data: { ...userDetails, token }
        };

    } catch (e) {
        console.error("Login error:", e);

        // 🔥 OPTIMIZATION: Better error messages without exposing details
        let errorMessage = 'An error occurred during login.';
        if (e.name === 'MongoNetworkError') {
            errorMessage = 'Database connection failed. Please try again.';
        } else if (e.name === 'ValidationError') {
            errorMessage = 'Invalid input data.';
        }

        return { status: 'fail', message: errorMessage };
    }
};

// 🔥 OPTIMIZATION: Non-blocking cart migration helper
const migrateCartNonBlocking = async (userId, guestId) => {
    try {
        // Use setTimeout to make it truly non-blocking
        setTimeout(async () => {
            try {
                await MigrateCartService({
                    headers: { user_id: userId },
                    cookies: { guestId }
                });
                console.log(`✅ Cart migrated for user: ${userId}`);
            } catch (err) {
                console.error("Cart migration failed:", err);
                // Don't throw - this shouldn't affect login
            }
        }, 0);
    } catch (error) {
        console.error("Cart migration setup failed:", error);
    }
};

export default UserLoginService;