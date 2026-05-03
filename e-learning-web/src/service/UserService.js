import axiosInstance from "./axiosInstance";

export const getMindInfo = async () => {
    return await axiosInstance.get(`${process.env.REACT_APP_API_BASE_URL}/users/mind`);
}

export const linkGoogleAccount = async (params) => {
    return await axiosInstance.post(`${process.env.REACT_APP_API_BASE_URL}/users/link-google-account`, params)
}

export const updateInfo = async ({ username, fullName, gender, dob, avatarFile }) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("fullName", fullName);
    formData.append("gender", gender);
    formData.append("dob", dob);
    if (avatarFile) {
        formData.append("avatarFile", avatarFile);
    }

    return await axiosInstance.post(`${process.env.REACT_APP_API_BASE_URL}/users/update-info`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}

export const changePassword = async ({oldPassword, newPassword}) => {
    return await axiosInstance.post(`${process.env.REACT_APP_API_BASE_URL}/users/change-pw`, {oldPassword, newPassword})
}