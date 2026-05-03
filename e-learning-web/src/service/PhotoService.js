import axiosInstance from "./axiosInstance"

export const uploadTempPhoto = async (photoFiles) => {
    const formData = new FormData();
    Array.from(photoFiles).forEach(file => {
        formData.append('files', file);
    });
    formData.append('isTemp', true);
    return await axiosInstance.post(`${process.env.REACT_APP_API_PHOTO_SERVICE_BASE_URL}/photos/upload`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}

export const removePhoto = async (ids) => {
    return await axiosInstance.post(`${process.env.REACT_APP_API_PHOTO_SERVICE_BASE_URL}/photos/remove`, ids)
}