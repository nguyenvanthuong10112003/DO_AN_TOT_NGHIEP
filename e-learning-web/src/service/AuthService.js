import axios from 'axios';
import axiosInstance from './axiosInstance';

export const loginWithGoogle = async (body) => {
    return await axiosInstance.post(`${process.env.REACT_APP_API_BASE_URL}/auth/login-with-google-account`, body);
}

export const login = async ({username, password, withRoleAdmin}) => {
    return await axiosInstance.post(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {username, password, withRoleAdmin});
}

export const refresh = async (token) => {
    return await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/refresh`, {token});
}

export const register = async ({username, password}) => {
    return await axiosInstance.post(`${process.env.REACT_APP_API_BASE_URL}/auth/register`, {username, password});
}

export const logout = async () => {
    return await axiosInstance.post(`${process.env.REACT_APP_API_BASE_URL}/auth/logout`);
}

export const sendVerifyCode = async (email) => {
    return await axiosInstance.post(`${process.env.REACT_APP_API_BASE_URL}/auth/create-verify-code`, {email})
}

export const createNewPassword = async (email, verifyCode) => {
    return await axiosInstance.post(`${process.env.REACT_APP_API_BASE_URL}/auth/create-new-password`, {email, verifyCode})
}