import emailRegex from "email-regex";
import { LOCAL_STORAGE_KEY, PHOTO_ALLOWED_TYPE, PHOTO_MAXIMUM_SIZE_MB, TEXT_EDITOR_TOOLBAR_BUTTONS, USER_ROLE } from "../define/define";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import ImageExtension from "@tiptap/extension-image";
import { CustomTextAlign } from "../comp/LessonEditorComp/CustomTextAlign";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

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
    if (data === null || data === undefined) return false;

    if (isString(data)) {
        return data.trim().length > 0;
    }

    if (Array.isArray(data)) {
        return data.length > 0;
    }

    if (isObject(data)) {
        return Object.keys(data).length > 0;
    }

    return true;
};

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

export const deepEquals = (a, b) => {
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
    return Object.prototype.toString.call(v) === '[object Object]';
}

export const isString = (v) => {
    return typeof v === 'string' || v instanceof String;
}

export const isFunction = (v) => {
    return typeof v === 'function';
}

export const isArray = (v) => {
    return Array.isArray(v);
}

export const isBoolean = (v) => {
    return typeof v === 'boolean';
}

export const validatePhoto = (file) => {
    if (file == null) {
        return "File không có dữ liệu!";
    }

    if (!file.type.startsWith("image/")) {
        return "File phải là ảnh!";
    }

    const type = file.type.replace('image/', '')

    if (!PHOTO_ALLOWED_TYPE.includes(type)) {
        return "Định dạng ảnh không hợp lệ!";
    }

    const MAX_SIZE_BYTES = PHOTO_MAXIMUM_SIZE_MB * 1024 * 1024;

    if (file.size > MAX_SIZE_BYTES) {
        return `Ảnh vượt quá ${PHOTO_MAXIMUM_SIZE_MB}MB!`;
    }

    return false;
}

export const excuteIfFunction = (fn, ...props) => {
    if (isFunction(fn)) return fn(...props);
}

const includesOption = (groupsBtn, optionName) => {
    return groupsBtn?.findIndex(options => Object.keys(options)?.findIndex(option => option === optionName) !== -1) !== -1
}

export const buildEditorConfig = (groupsBtn, { editable, content, placeholder, onChange }, editor) => {
    return {
        editable,
        content,
        extensions: [
            StarterKit.configure({}),
            includesOption(groupsBtn, "UNDERLINE") && Underline,
            TextStyle,
            Color,
            includesOption(groupsBtn, "HIGHLIGHT") && Highlight.configure({ multicolor: false }),
            Object.keys(TEXT_EDITOR_TOOLBAR_BUTTONS.ALIGN).some(key => includesOption(groupsBtn, key)) && CustomTextAlign.configure({
                types: ["heading", "paragraph", "image"],
            }),
            includesOption(groupsBtn, "LINK") && Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    target: "_blank",
                    rel: "noopener noreferrer",
                },
            }),
            includesOption(groupsBtn, "IMAGE") && ImageExtension.configure({ allowBase64: false }),
            Placeholder.configure({ placeholder }),
            CharacterCount,
        ].filter(Boolean),
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
    }
}