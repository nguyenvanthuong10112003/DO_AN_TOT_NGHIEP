import { loadingStore } from "../store/LoadingStore";
import axiosInstance from "./axiosInstance"
const controller = new AbortController();

export const uploadTempPhoto = async (photoFiles) => {
    const formData = new FormData();
    Array.from(photoFiles).forEach(file => {
        formData.append('files', file);
    });
    formData.append('isTemp', true);
    return await axiosInstance.post(`${process.env.REACT_APP_API_MEDIA_SERVICE_BASE_URL}/photos/upload`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}

export const uploadTempVideo = async (videoFile, isTemp) => {
    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('isTemp', true);
    return await axiosInstance.post(`${process.env.REACT_APP_API_MEDIA_SERVICE_BASE_URL}/videos/upload`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        },
        timeout: 0,
        skipLoading: true,
        signal: controller.signal,
        showError: false,
    })
}

export const cancel = () => {
    if (!controller.signal.aborted) {
        controller.abort();
    }
};

export const createSession = async (videoId) => {
    return await axiosInstance.post(`${process.env.REACT_APP_API_MEDIA_SERVICE_BASE_URL}/videos/create-session`, {videoId}, {
        skipLoading: true,
    })
}