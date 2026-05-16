import emailRegex from "email-regex";
import { LOCAL_STORAGE_KEY, USER_ROLE } from "../define/define";

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
    localStorage.removeItem(LOCAL_STORAGE_KEY.COURSE_DATA_TEMP);
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
    return data !== null && data !== undefined && (String(data).trim().length > 0 || Object.keys(data).length > 0);
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
    if (isArray(roles)) return roles.some(r => r === role);
    return false;
}

export const getEmail = () => {
    return localStorage.getItem(LOCAL_STORAGE_KEY.USER_EMAIL);
}

export const formatNumber = (val) => {
    if (!hasData(val)) return "";

    val = val.toString();

    val = val.replace(/^0+(?=\d)/, "");

    const [intPart, decimalPart] = val.split(".");

    return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        (decimalPart !== undefined ? "." + decimalPart : "");
};
 
export const formatDate = (date) => {
  if (!hasData(date)) return "";
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replaceAll('/', '-');
};

export const formatDateTime = (date) => {
  if (!hasData(date)) return "";
  return new Date(date).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const deepEquals = (a,b) => {
    if (!hasData(a) && !hasData(b)) return true;
    else if (typeof a != typeof b) return false;
    else if (isObject(a) && isObject(b)) {
        const aKeys = new Set(Object.keys(a));
        const bKeys = new Set(Object.keys(b));
        const keys = new Set([...aKeys, ...bKeys]);
        for (const key of keys) {
            if (!deepEquals(a[key], b[key])) return false;
        }
        return true;
    } 
    else if (isArray(a) && isArray(b)) {
        for (let i = 0; i < a.length; i++) {
            if (!deepEquals(a[i], b[i])) return false;
        }
        return true;
    }
    else
        return a === b;
}

export const isAllNumberOrLatin = (str) => {
    if (!hasData(str)) return true;
    return str.split("").every(c => (c >= '0' && c <= '9') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z'));
}

export const trimAll = (str) => {
    if (!hasData(str)) return str;
    if (isString(str)) return str.trim();
    if (isArray(str)) return str.map(s => trimAll(s));
    if (isObject(str)) {
        const newObj = {};
        Object.keys(str).forEach(k => {
            newObj[k] = trimAll(str[k]);
        })
        return newObj;
    }
    return str;
}

export const isObject = (v) => {
    return v instanceof Object || typeof v === typeof {};
}

export const isString = (v) => {
    return v instanceof String || typeof v === typeof '  ';
}

export const isFunction = (v) => {
    return v instanceof Function || typeof v === typeof (() => { });
}

export const isArray = (v) => {
    return Array.isArray(v);
}

export const isBoolean = (v) => {
    return v instanceof Boolean || v === true || v === false;
}