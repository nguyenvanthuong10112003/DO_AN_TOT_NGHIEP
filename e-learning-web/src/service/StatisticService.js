import axiosInstance from "./axiosInstance";

export const getAdminStatistics = async () => {
    return await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/statistics`, {
        skipLoading: true,
    });
}