import axiosInstance from "./axiosInstance";

export const getAllSector = async () => {
    return await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/courses/get-all-sector`)
}

export const getAllTopic = async (sectorId) => {
    return await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/courses/get-all-topic?sectorId=${sectorId}`)
}

export const createCourse = async ({}) => {

}