import UserCreateService from "../../services/users/UserCreateService.js"
import UserLoginService from "../../services/users/UserLoginService.js";
import {UserDetailsService} from "../../services/users/UserDetailsService.js";
import {UserVerifyEmailService} from "../../services/users/UserVerifyEmailService.js";
import {UserVerifyOtpService} from "../../services/users/UserVerifyOtpService.js";
import {UserResetPassService} from "../../services/users/UserResetPassService.js";
import {UserUpdateService} from "../../services/users/UserUpdateService.js";
import UserLogoutService from "../../services/users/UserLogoutService.js";
import {UserDetailsServiceByRole} from "../../services/users/UserDetailsServiceByRole.js";
import DataModel from "../../models/users/UsersModel.js";
import {UserDetailsByIdService} from "../../services/users/UserDetailsByIdService.js";
import {UserUpdateByIdService} from "../../services/users/UserUpdateByIdService.js";
import {UserDeleteService} from "../../services/users/UserDeleteService.js";

// Registration
export const Registration = async (req, res) => {
    const result = await UserCreateService(req);
    res.json(result);
}

// Login
export const Login = async (req, res) => {
    const result = await UserLoginService(req, res);
    res.json(result);
}

// Logout
export const Logout = async (req, res) => {
    const result = await UserLogoutService(req, res);
    res.json(result);
}

// Details
export const Details = async (req, res) => {
    const result = await UserDetailsService(req, res);
    res.json(result);
}

// Email Verify
export const EmailVerify = async (req, res) => {
    const result = await UserVerifyEmailService(req, res);
    res.json(result);
}

// Otp Verify
export const VerifyOtp = async (req, res) => {
    const result = await UserVerifyOtpService(req, res);
    res.json(result);
}

// Reset Password
export const ResetPassword = async (req, res) => {
    const result = await UserResetPassService(req, res);
    res.json(result);
}

// Profile Update
export const ProfileUpdate = async (req, res) => {
    const result = await UserUpdateService(req, res);
    res.json(result);
}

// All User Details By Role
export const UserDetails = async (req, res) => {
    const SearchRegx = { "$regex": req.params.searchKeyword, "$options": "i" };
    const SearchArray = [{email: SearchRegx}, {mobile: SearchRegx}];
    const result = await UserDetailsServiceByRole(req, DataModel, SearchArray, {_id: 1, photo:0, password: 0, createdAt: 0, updatedAt: 0 });
    res.json(result);
}

// User Details By Id
export const DetailsByIdService = async (req, res) => {
    const result = await UserDetailsByIdService(req, res);
    res.json(result);
}

// User Role & Banned or Acitve Update By Id
export const UpdateByIdService = async (req, res) => {
    const result = await UserUpdateByIdService(req, res);
    res.json(result);
}

// User Delete
export const DeleteUser = async (req, res) => {
    const result = await UserDeleteService(req, DataModel);
    res.json(result);
}
























