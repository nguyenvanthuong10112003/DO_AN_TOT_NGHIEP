export const LOCAL_STORAGE_KEY = Object.freeze({
    ACCESS_TOKEN: 'access_token',
    USER_ID: 'user_id',
    USER_FULL_NAME: 'user_full_name',
    USER_EMAIL: 'user_email',
    USER_USERNAME: 'user_username',
    USER_AVATAR: 'user_avatar',
    USER_ROLES: 'user_roles',
    USER_GENDER: 'user_gender',
    ACCESS_TOKEN_EXPIRATION: 'access_token_expiration',
    MESSAGE: 'LOCAL_STORAGE_MESSAGE_KEY',
    BEFORE_URL: 'BEFORE_URL',
    COURSE_DATA_TEMP: 'COURSE_DATA_TEMP'
})

export const PAGE_LOCATION = Object.freeze({
    HOME: '/home',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGET: '/auth/forget',
    LOGIN_ADMIN: '/admin/auth/login',
    ADMIN: '/admin',
    COURSES: '/courses',
    USER_INDEX: '/user',
    USER_INFO: '/user/info',
    USER_CHANGE_PW: '/user/change-pw',
    ADMIN_CREATE_COURSE: '/admin/course/create',
    ADMIN_UPDATE_COURSE: '/admin/course/update',
    ADMIN_DETAIL_COURSE: (courseId) => `/admin/course/${courseId}`,
    ADMIN_MANAGEMENT_COURSE: '/admin/course',
    ADMIN_MANAGEMENT_LESSON: (courseId) => `/admin/course/${courseId}/lesson`
})

export const USER_ROLE = Object.freeze({
    ADMIN: 'ADMIN',
    USER: 'USER',
})

export const DIFFICULT = Object.freeze({
    BASIC: 'Cơ bản',
    INTERMEDIATE: 'Trung cấp',
    ADVANCED: 'Nâng cao',
    EXPERT: 'Chuyên gia'
})

export const LANGUAGE = Object.freeze({
    VI: 'Tiếng việt',
    EN: 'English'
})

export const COURSE_TYPE = Object.freeze({
    FREE: 'Miễn phí', 
    PAID: 'Trả phí'
})

export const ACTION = Object.freeze({
    CREATE: 'CREATE', 
    UPDATE: 'UPDATE'
})