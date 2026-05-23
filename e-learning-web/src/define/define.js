import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Code2, Heading, Heading1, Heading2, Heading3, Highlighter, ImageIcon, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, RemoveFormatting, Strikethrough, Underline, Undo2 } from "lucide-react"

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

export const PHOTO_ALLOWED_TYPE = Object.freeze(
    String(process.env.REACT_APP_PHOTO_ALLOWED_TYPE)?.split(',')
)

export const VIDEO_ALLOWED_TYPE = Object.freeze(
    String(process.env.REACT_APP_VIDEO_ALLOWED_TYPE)?.split(',')
)

export const RATIOS = Object.freeze({
    FREE: {
        label: 'Tự do',
        value: null,
        avatar: false,
    },

    SQUARE: {
        label: '1 : 1',
        value: 1,
        avatar: false,
    },

    LANDSCAPE_4_3: {
        label: '4 : 3',
        value: 4 / 3,
        avatar: false,
    },

    LANDSCAPE_16_9: {
        label: '16 : 9',
        value: 16 / 9,
        avatar: false,
    },

    LANDSCAPE_3_2: {
        label: '3 : 2',
        value: 3 / 2,
        avatar: false,
    },

    PORTRAIT_2_3: {
        label: '2 : 3',
        value: 2 / 3,
        avatar: false,
    },

    AVATAR: {
        label: '⬤ Avatar',
        value: 1,
        avatar: true,
    },
});

export const PHOTO_MAXIMUM_SIZE_MB = Number(process.env.REACT_APP_PHOTO_MAXIMUM_SIZE)
export const VIDEO_MAXIMUM_SIZE_MB = Number(process.env.REACT_APP_VIDEO_MAXIMUM_SIZE)

export const QUESTION_TYPE = Object.freeze({
    CHOICE: {
        id: 'CHOICE',
        name: 'Câu hỏi trắc nghiệm một đáp án'
    },
    MULTI_CHOICE: {
        id: 'MULTI_CHOICE',
        name: 'Câu hỏi trắc nghiệm nhiều đáp án'
    },
    FILL: {
        id: 'FILL',
        name: 'Điền đáp án vào ô trống'
    },
    ARGUMENT: {
        id: 'ARGUMENT',
        name: 'Trả lời đáp án'
    }
})

export const TEXT_EDITOR_TOOLBAR_BUTTONS = Object.freeze({
  HISTORY: {
    UNDO: {
      type: "button",
      icon: Undo2,
      title: "Hoàn tác (Ctrl+Z)",
      action: (editor) => editor?.chain()?.focus()?.undo()?.run(),
      active: false,
      disabled: (editor) => !editor?.can()?.undo(),
    },

    REDO: {
      type: "button",
      icon: Redo2,
      title: "Làm lại (Ctrl+Y)",
      action: (editor) => editor?.chain()?.focus()?.redo()?.run(),
      active: false,
      disabled: (editor) => !editor?.can()?.redo(),
    },
  },

  HEADING: {
    HEADING_1: {
      type: "button",
      icon: Heading1,
      title: "Tiêu đề 1",
      action: (editor) =>
        editor?.chain()?.focus()?.toggleHeading({ level: 1 })?.run(),
      active: (editor) =>
        editor?.isActive("heading", { level: 1 }),
    },

    HEADING_2: {
      type: "button",
      icon: Heading2,
      title: "Tiêu đề 2",
      action: (editor) =>
        editor?.chain()?.focus()?.toggleHeading({ level: 2 })?.run(),
      active: (editor) =>
        editor?.isActive("heading", { level: 2 }),
    },

    HEADING_3: {
      type: "button",
      icon: Heading3,
      title: "Tiêu đề 3",
      action: (editor) =>
        editor?.chain()?.focus()?.toggleHeading({ level: 3 })?.run(),
      active: (editor) =>
        editor?.isActive("heading", { level: 3 }),
    },
  },

  FORMATTING: {
    BOLD: {
      type: "button",
      icon: Bold,
      title: "In đậm (Ctrl+B)",
      action: (editor) =>
        editor?.chain()?.focus()?.toggleBold()?.run(),
      active: (editor) =>
        editor?.isActive("bold"),
    },

    ITALIC: {
      type: "button",
      icon: Italic,
      title: "In nghiêng (Ctrl+I)",
      action: (editor) =>
        editor?.chain()?.focus()?.toggleItalic()?.run(),
      active: (editor) =>
        editor?.isActive("italic"),
    },

    UNDERLINE: {
      type: "button",
      icon: Underline,
      title: "Gạch dưới (Ctrl+U)",
      action: (editor) =>
        editor?.chain()?.focus()?.toggleUnderline()?.run(),
      active: (editor) =>
        editor?.isActive("underline"),
    },

    STRIKE: {
      type: "button",
      icon: Strikethrough,
      title: "Gạch ngang",
      action: (editor) =>
        editor?.chain()?.focus()?.toggleStrike()?.run(),
      active: (editor) =>
        editor?.isActive("strike"),
    },

    HIGHLIGHT: {
      type: "button",
      icon: Highlighter,
      title: "Tô sáng",
      action: (editor) =>
        editor?.chain()?.focus()?.toggleHighlight()?.run(),
      active: (editor) =>
        editor?.isActive("highlight"),
    },

    INLINE_CODE: {
      type: "button",
      icon: Code2,
      title: "Inline code",
      action: (editor) =>
        editor?.chain()?.focus()?.toggleCode()?.run(),
      active: (editor) =>
        editor?.isActive("code"),
    },
  },

  ALIGN: {
    LEFT: {
      type: "button",
      icon: AlignLeft,
      title: "Căn trái",
      action: (editor) =>
        editor?.chain()?.focus()?.setTextAlign("left")?.run(),
      active: (editor) =>
        editor?.isActive({ textAlign: "left" }),
    },

    CENTER: {
      type: "button",
      icon: AlignCenter,
      title: "Căn giữa",
      action: (editor) =>
        editor?.chain()?.focus()?.setTextAlign("center")?.run(),
      active: (editor) =>
        editor?.isActive({ textAlign: "center" }),
    },

    RIGHT: {
      type: "button",
      icon: AlignRight,
      title: "Căn phải",
      action: (editor) =>
        editor?.chain()?.focus()?.setTextAlign("right")?.run(),
      active: (editor) =>
        editor?.isActive({ textAlign: "right" }),
    },

    JUSTIFY: {
      type: "button",
      icon: AlignJustify,
      title: "Căn đều",
      action: (editor) =>
        editor?.chain()?.focus()?.setTextAlign("justify")?.run(),
      active: (editor) =>
        editor?.isActive({ textAlign: "justify" }),
    },
  },

  LIST: {
    BULLET_LIST: {
      type: "button",
      icon: List,
      title: "Danh sách",
      action: (editor) =>
        editor?.chain()?.focus()?.toggleBulletList()?.run(),
      active: (editor) =>
        editor?.isActive("bulletList"),
    },

    ORDERED_LIST: {
      type: "button",
      icon: ListOrdered,
      title: "Danh sách số",
      action: (editor) =>
        editor?.chain()?.focus()?.toggleOrderedList()?.run(),
      active: (editor) =>
        editor?.isActive("orderedList"),
    },

    BLOCKQUOTE: {
      type: "button",
      icon: Quote,
      title: "Trích dẫn",
      action: (editor) =>
        editor?.chain()?.focus()?.toggleBlockquote()?.run(),
      active: (editor) =>
        editor?.isActive("blockquote"),
    },

    HORIZONTAL_RULE: {
      type: "button",
      icon: Minus,
      title: "Đường kẻ ngang",
      action: (editor) =>
        editor?.chain()?.focus()?.setHorizontalRule()?.run(),
      active: false,
    },
  },

  INSERT: {
    IMAGE: {
      type: "button",
      icon: ImageIcon,
      title: "Chèn ảnh",
      action: (editor, { onImageClick }) => onImageClick(editor),
      active: false,
    },

    LINK: {
      type: "button",
      icon: Link2,
      title: "Chèn link",
      action: (editor, { setLink }) => setLink(editor),
      active: (editor) =>
        editor?.isActive("link"),
    },
  },

  CLEAR: {
    CLEAR_FORMATTING: {
      type: "button",
      icon: RemoveFormatting,
      title: "Xoá định dạng",
      action: (editor) =>
        editor?.chain()?.focus()?.clearNodes()?.unsetAllMarks()?.run(),
      active: false,
    },
  },
});