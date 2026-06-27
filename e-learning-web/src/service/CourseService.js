import { hasData } from "../helper/utils";
import axiosInstance from "./axiosInstance";

export const getAllSector = async () => {
    return await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/courses/get-all-sector`)
}

export const getAllTopic = async (sectorId) => {
    return await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/courses/get-all-topic${sectorId ?`?sectorId=${sectorId}` : ''}`)
}

export const createOrUpdateCourse = async (body) => {
    return await axiosInstance.post(`${process.env.REACT_APP_API_BASE_URL}/admin/courses/createOrUpdate`, body)
}

export const searchCourse = async (keyword) => {
    return await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/courses/search-courses?key=${keyword}`)
}

export const searchTag = async (keyword) => {
    return await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/courses/search-tags?key=${keyword}`)
}

export const getCourseById = async (courseId) => {
    return await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/courses/${courseId}`)
}

export const searchCourseLimit = async ({keyword, sectorId, topicId, difficult, language, type, priceFrom, priceTo, pageNumber, pageSize, sortBy, sortMode}) => {
    return await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/courses/search-courses-limit?key=${keyword || ''}${hasData(sectorId) ? '&sectorId=' + sectorId : ''}${hasData(topicId) ? '&topicId=' + topicId : ''}${hasData(difficult) ? `&difficult=${difficult}` : ''}${hasData(language) ? `&language=${language}` : ''}${hasData(type) ? `&type=${type}` : ''}${hasData(priceFrom) ? `&priceFrom=${priceFrom}` : ''}${hasData(priceTo) ? `&priceTo=${priceTo}` : ''}&pageNumber=${pageNumber}&pageSize=${pageSize}&orderBy=${sortBy}&orderMode=${sortMode}`)
}

export const countCourse = async () => {
    return await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/courses/count`)
}

export const removeCourse = async (ids) => {
    return await axiosInstance.post(`${process.env.REACT_APP_API_BASE_URL}/admin/courses/remove`, ids)
}

export const createOrUpdateLesson = async (courseId, chapters) => {
    return await axiosInstance.post(`${process.env.REACT_APP_API_BASE_URL}/admin/courses/lessons/createOrUpdate`, { chapters, courseId })
}

export const getCourseDetailById = async (courseId) => {
    return await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/courses/${courseId}/detail`)
}

export const getLessonById = async (lessonId) => {
    return await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/lessons/${lessonId}`)
}

export const finishLesson = async (lessonId) => {
    return await axiosInstance.post(`${process.env.REACT_APP_API_BASE_URL}/lessons/${lessonId}/finish`)
}

export const subscribeCourse = async (courseId) => {
    return await axiosInstance.post(`${process.env.REACT_APP_API_BASE_URL}/courses/subscribe`, {
        courseId
    })
}