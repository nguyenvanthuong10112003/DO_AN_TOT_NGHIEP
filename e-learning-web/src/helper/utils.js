import emailRegex from "email-regex";
import { LOCAL_STORAGE_KEY, USER_ROLE } from "../define/define";
import { jwtDecode } from 'jwt-decode';
import { type } from "@testing-library/user-event/dist/type";
import { hasUnsavedChangesStore } from "../store/HasUnsavedChangesStore";

export const getToken = () => {
    return localStorage.getItem(LOCAL_STORAGE_KEY.ACCESS_TOKEN);
}

export const getUrlGoogleLogin = (redirectUri) => {
    return `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;
}

export const handlerLoginSuccess = (accessToken, userInfo) => {
    if (userInfo?.id)
        localStorage.setItem(LOCAL_STORAGE_KEY.USER_ID, userInfo?.id);
    if (userInfo?.fullName)
        localStorage.setItem(LOCAL_STORAGE_KEY.USER_FULL_NAME, userInfo?.fullName);
    if (userInfo?.email)
        localStorage.setItem(LOCAL_STORAGE_KEY.USER_EMAIL, userInfo?.email);
    if (userInfo?.username)
        localStorage.setItem(LOCAL_STORAGE_KEY.USER_USERNAME, userInfo?.username);
    if (userInfo?.avatar)
        localStorage.setItem(LOCAL_STORAGE_KEY.USER_AVATAR, userInfo?.avatar);
    if (userInfo?.roles)
        localStorage.setItem(LOCAL_STORAGE_KEY.USER_ROLES, JSON.stringify(userInfo?.roles));
    if (userInfo.gender)
        localStorage.setItem(LOCAL_STORAGE_KEY.USER_GENDER, userInfo?.gender);
    localStorage.setItem(LOCAL_STORAGE_KEY.ACCESS_TOKEN, accessToken);
}

export const handlerLogoutSuccess = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY.ACCESS_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEY.USER_ID);
    localStorage.removeItem(LOCAL_STORAGE_KEY.USER_FULL_NAME);
    localStorage.removeItem(LOCAL_STORAGE_KEY.USER_EMAIL);
    localStorage.removeItem(LOCAL_STORAGE_KEY.USER_USERNAME);
    localStorage.removeItem(LOCAL_STORAGE_KEY.USER_AVATAR);
    localStorage.removeItem(LOCAL_STORAGE_KEY.USER_ROLES);
    localStorage.removeItem(LOCAL_STORAGE_KEY.USER_GENDER);
}

export const getUserInfo = () => {
    return {
        id: localStorage.getItem(LOCAL_STORAGE_KEY.USER_ID),
        fullName: localStorage.getItem(LOCAL_STORAGE_KEY.USER_FULL_NAME),
        email: localStorage.getItem(LOCAL_STORAGE_KEY.USER_EMAIL),
        username: localStorage.getItem(LOCAL_STORAGE_KEY.USER_USERNAME),
        avatar: localStorage.getItem(LOCAL_STORAGE_KEY.USER_AVATAR),
        gender: getBoolValue(localStorage.getItem(LOCAL_STORAGE_KEY.USER_GENDER)),
        roles: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_ROLES))
    }
}

export const getBoolValue = (value) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
}

export const checkUserWithRoles = (roles) => {
    const userRoles = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_ROLES));
    return roles?.some(role => userRoles?.includes(role?.toUpperCase()));
}

export const createMessage = (message, type) => {
    sessionStorage.setItem(LOCAL_STORAGE_KEY.MESSAGE, JSON.stringify({ message, type }));
}

export const hasData = (data) => {
    return data !== null && data !== undefined && String(data).trim().length > 0 && Object.keys(data).length > 0;
}

export const isEmailValid = (email) => {
    return emailRegex({ exact: true }).test(email);
}

export const displayDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

export const betweenDateByYear = (fromDate, toDate) => {
    if (!hasData(fromDate) || !hasData(toDate)) return -1;
    const fromDateValue = new Date(fromDate);
    const toDateValue = new Date(toDate); 
    if (!hasData(fromDateValue) || !hasData(toDateValue)) return -1;

    let age = toDateValue.getFullYear() - fromDateValue.getFullYear();

    const m = toDateValue.getMonth() - fromDateValue.getMonth();
    if (m < 0 || (m === 0 && toDateValue.getDate() < fromDateValue.getDate())) {
        age--;
    }

    return age;
}

export const getDisplayRole = (role) => {
    if (role === USER_ROLE.USER) return 'Người dùng';
    else if (role === USER_ROLE.ADMIN) return 'Quản trị hệ thống';
}

export const hasRole = (role) => {
    const roles = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.USER_ROLES));
    if (roles instanceof Array) return roles.some(r => r === role);
    return false;
}

export const getEmail = () => {
    return localStorage.getItem(LOCAL_STORAGE_KEY.USER_EMAIL);
}

export const isFunctionType = (object) => {
    return object instanceof Function;
}


export const formatNumber = (val) => {
    if (!val) return "";
    const [intPart, decimalPart] = val.split(".");
    return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        (decimalPart !== undefined ? "." + decimalPart : "");
};
 
export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN");
};

export const formatDateTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("vi-VN");
};

export const deepEquals = (a,b) => {
    if (!hasData(a) && !hasData(b)) return true;
    else if (a instanceof Array && b instanceof Array) {
        for (let i = 0; i < a.length; i++) {
            if (!deepEquals(a[i], b[i])) return false;
        }
        return true;
    }
    else if (a instanceof Object && b instanceof Object) {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        const keys = [...aKeys, ...bKeys.filter(k => aKeys.findIndex(k1 => k1 === k) === -1)]
        for (let i = 0; i < keys.length; i++) {
            if (!deepEquals(a[keys[i]], b[keys[i]])) return false;
        }
        return true;
    } 
    else
        return a === b;
}