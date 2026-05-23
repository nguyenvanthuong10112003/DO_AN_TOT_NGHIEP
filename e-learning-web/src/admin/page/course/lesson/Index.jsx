import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import '../style.css';
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faArrowUpRightFromSquare, faCheck, faClipboardCheck, faFileLines, faGear, faGripVertical, faInfo, faInfoCircle, faListCheck, faNewspaper, faPlay, faPlus, faSave, faWarehouse } from "@fortawesome/free-solid-svg-icons";
import { PAGE_LOCATION, QUESTION_TYPE, TEXT_EDITOR_TOOLBAR_BUTTONS, VIDEO_ALLOWED_TYPE, VIDEO_MAXIMUM_SIZE_MB } from "../../../../define/define";
import { getCourseById } from "../../../../service/CourseService";
import TextEditor from "../../../../comp/TextEditor";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { buildEditorConfig } from "../../../../helper/utils";
const LESSON_TYPE = {
    ARTICLE: {
        id: "ARTICLE",
        label: "Bài viết",
        icon: faFileLines,
        bg: "#E6F1FB",
        color: "#0C447C",
    },
    VIDEO: {
        id: "video",
        label: "Video",
        icon: faPlay,
        bg: "#E1F5EE",
        color: "#085041",
    },
    TEST: {
        id: "test",
        label: "Bài kiểm tra",
        icon: faListCheck,
        bg: "#EEEDFE",
        color: "#3C3489",
    },
};
const constructLesson = () => {
    return {
        type: Object.keys(LESSON_TYPE)[0]
    }
}
const LessonIndex = () => {
    const { courseId } = useParams();
    const {
        handleReset,
        setTitle,
        setIsMainFull,
        setControllers,
        openPopupConfirmAlert,
        setBgColor,
        openPopupUploadImage
    } = useOutletContext();
    const navigate = useNavigate();
    const [course, setCourse] = useState({});
    const [lesson, setLesson] = useState(constructLesson());
    const [tempImages, setTempImages] = useState([])

    useEffect(() => {
        setTitle?.('Quản lý bài học')
        setIsMainFull?.(true)
        getCourseById(courseId)
            .then(res => {
                setCourse(res.data.data)
            })
            .catch(_ => { })

        return () => {
            handleReset?.()
        }
    }, [courseId])

    const pushTempImage = (newTempImageId) => {
        if (!newTempImageId) return;
        setTempImages(prev => [...(prev || []), newTempImageId])
    }

    return <div className="wrap p-4">
        <div className="topbar !items-start bg-white p-4 section-card flex-col flex-wrap xs:flex-row">
            <button className="back-btn" type="button" onClick={_ => navigate(PAGE_LOCATION.ADMIN_DETAIL_COURSE(courseId))} >
                <FontAwesomeIcon icon={faArrowLeft} />Khóa học</button>
            <div className="det-title-block">
                <div className="det-title capitalize" id="det-name">{course.name}</div>
                <div className="det-breadcrumb capitalize">{course.description}</div>
            </div>
            <div>
                <button type="button" className="btn-pub !bg-gray-700"><FontAwesomeIcon icon={faCheck} />Lưu</button>
            </div>
        </div>

        <hr className="my-4"></hr>

        <div className="layout !grid-cols-1 md:![grid-template-columns:1fr_300px]">

            <div className="main-panel order-2 md:order-1 gap-4">

                <div className="section-card p-4">
                    <div className="section-title section-color-4"><FontAwesomeIcon icon={faWarehouse} />Loại bài học</div>
                    <div className="type-grid !grid-cols-3 gap-4" id="type-grid">
                        {Object.keys(LESSON_TYPE).map((key, index) => {
                            const type = LESSON_TYPE[key];
                            return (
                                <button
                                    key={index}
                                    className={`type-card gap-2 ${lesson.type === type.id ? "selected" : ""
                                        }`}
                                    onClick={() => setLesson(prev => ({ ...prev, type: type.id }))}
                                >
                                    <div
                                        className="tc-icon"
                                        style={{ background: type.bg }}
                                    >
                                        <FontAwesomeIcon
                                            style={{
                                                color: type.color,
                                                fontSize: "18px",
                                            }}
                                            icon={type.icon}
                                        />
                                    </div>

                                    <span className="tc-label">{type.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="section-card p-4">
                    <div className="section-title section-color-4"><FontAwesomeIcon icon={faInfoCircle} />Thông tin chung</div>
                    <div className="form-grid gap-4">
                        <div className="field form-full">
                            <label>Tên bài học <span style={{ 'color': 'var(--color-text-danger,#E24B4A)' }}>*</span></label>
                            <input type="text" id="lesson-title" placeholder="Nhập tên bài học..." />
                        </div>
                        <div className="field">
                            <label>Thuộc chương</label>
                            <select id="lesson-chapter"><option value="1">Giới thiệu Python</option><option value="2">Cấu trúc dữ liệu</option><option value="3">Hàm &amp; Module</option></select>
                        </div>
                        <div className="field">
                            <label>Thứ tự trong chương</label>
                            <input type="number" id="lesson-order" value="1" min="1" />
                        </div>
                        <div className="field form-full">
                            <label>Mô tả ngắn</label>
                            <textarea id="lesson-desc" rows="2" placeholder="Học viên sẽ học được gì trong bài này..."></textarea>
                        </div>
                    </div>
                </div>

                {lesson.type === LESSON_TYPE.ARTICLE.id && <div className="section-card overflow-hidden">
                    <TextEditor pushTempImage={pushTempImage} openPopupUploadImage={openPopupUploadImage} groupsBtn={Object.values(TEXT_EDITOR_TOOLBAR_BUTTONS).reduce((list, item) => [...list, item], [])} />
                </div>}

                {lesson.type === LESSON_TYPE.VIDEO.id && <RenderVideoForm />}
                {lesson.type === LESSON_TYPE.TEST.id && <RenderTestForm />}

                <div className="section-card p-4">
                    <div className="section-title section-color-4"><FontAwesomeIcon icon={faGear} />Cài đặt bài học</div>
                    <div className="form-grid !grid-cols-3 gap-4">
                        <div className="field">
                            <label>Thời lượng (phút)</label>
                            <input type="number" placeholder="15" min="1" />
                        </div>
                        <div className="field">
                            <label>Điểm tối đa</label>
                            <input type="number" placeholder="100" min="0" id="max-score" />
                        </div>
                        <div className="field">
                            <label>Điểm đạt</label>
                            <input type="number" placeholder="70" min="0" id="pass-score" />
                        </div>

                        <div className="form-full " >
                            <div className="cert-toggle ">
                                <div className="toggle-sw on" ></div>
                                <div>
                                    <div className="toggle-label">Bắt buộc hoàn thành</div>
                                    <div className="toggle-sub">Học viên phải xong bài này mới mở bài tiếp</div>
                                </div>
                            </div>
                        </div>
                        <div className="form-full " >
                            <div className="cert-toggle ">
                                <div className="toggle-sw " ></div>
                                <div>
                                    <div className="toggle-label">Cho phép xem trước</div>
                                    <div className="toggle-sub">Học viên chưa mua vẫn xem được bài này</div>
                                </div>
                            </div>
                        </div>
                        <div className="form-full " >
                            <div className="cert-toggle ">
                                <div className="toggle-sw " id="sw-answer"></div>
                                <div>
                                    <div className="toggle-label">Hiển thị đáp án</div>
                                    <div className="toggle-sub">Hiện đáp án đúng sau khi nộp bài</div>
                                </div>
                            </div>
                        </div>
                        <div className="form-full " >
                            <div className="cert-toggle ">
                                <div className="toggle-sw "></div>
                                <div>
                                    <div className="toggle-label">Trộn câu hỏi</div>
                                    <div className="toggle-sub">Ngẫu nhiên thứ tự câu hỏi mỗi lần thi</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="section-card p-4 flex flex-row justify-between items-center">
                    <button className="btn-prev"><FontAwesomeIcon icon={faArrowLeft} />Bài trước</button>

                    <span className="lesson-progress" id="lesson-prog">Bài 1 / 8</span>

                    <button className="btn-next !bg-gray-700">Bài tiếp theo<FontAwesomeIcon icon={faArrowRight} /></button>
                </div>

            </div>

            <div className="sidebar order-1 md:order-2 pb-1">
                <div className="sb-head space-y-2 !bg-white">
                    <span className="section-title text-nowrap !mb-0">Chương trình học</span>
                    <button className="sb-add-ch text-nowrap !text" >
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm chương
                    </button>
                </div>
                <div id="chapter-tree" className="max-h-[50vh] overflow-auto">
                    <div className="chapter-block">
                        <div className="ch-header" >
                            <i className="ti ti-chevron-right ch-icon open" id="ch-icon-1" aria-hidden="true"></i>
                            <span className="ch-name">Giới thiệu Python</span>
                            <span className="ch-count">3</span>
                        </div>
                        <div id="ch-lessons-1" >
                            <div className="lesson-list">

                                <div className="lesson-item active" >
                                    <div className="li-type-dot" style={{ background: "#E1F5EE" }}>
                                        <FontAwesomeIcon icon={LESSON_TYPE['VIDEO'].icon} />
                                    </div>
                                    <span className="li-name">Python là gì ghfjkghkghgkgjkhg?</span>
                                    <FontAwesomeIcon icon={faGripVertical} className="li-drag" />
                                </div>
                                <div className="lesson-item" >
                                    <div className="li-type-dot" style={{ background: "#E6F1FB" }}>
                                        <FontAwesomeIcon
                                            icon={faFileLines}
                                            style={{ color: "#0C447C", fontSize: "11px" }}
                                        />
                                    </div>
                                    <span className="li-name">Cài đặt môi trường hgklghklhglhghgklklhklgh</span>
                                    <FontAwesomeIcon icon={faGripVertical} className="li-drag" />
                                </div>
                                <div className="lesson-item" >
                                    <div className="li-type-dot" style={{ background: "#EEEDFE" }}>
                                        <FontAwesomeIcon
                                            icon={faListCheck}
                                            style={{ color: "#3C3489", fontSize: "11px" }}
                                        />
                                    </div>
                                    <span className="li-name">Kiểm tra bài 1</span>
                                    <FontAwesomeIcon icon={faGripVertical} className="li-drag" />
                                </div>
                            </div>
                            <div className="add-lesson-row">
                                <button className="add-lesson-btn" >
                                    <FontAwesomeIcon className="text-xs" icon={faPlus} />Thêm bài học
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="chapter-block">
                        <div className="ch-header" >
                            <i className="ti ti-chevron-right ch-icon open" id="ch-icon-2" aria-hidden="true"></i>
                            <span className="ch-name">Cấu trúc dữ liệu</span>
                            <span className="ch-count">3</span>
                        </div>
                        <div id="ch-lessons-2" >
                            <div className="lesson-list">

                                <div className="lesson-item" >
                                    <div className="li-type-dot" style={{ background: "#E1F5EE" }}>
                                        <i className="ti ti-player-play" style={{ color: "#085041", fontSize: "11px" }} aria-hidden="true"></i>
                                    </div>
                                    <span className="li-name">List và Tuple</span>
                                    <FontAwesomeIcon icon={faGripVertical} className="li-drag" />
                                </div>
                                <div className="lesson-item" >
                                    <div className="li-type-dot" style={{ background: "#E6F1FB" }}>
                                        <i className="ti ti-article" style={{ color: "#0C447C", fontSize: "11px" }} aria-hidden="true"></i>
                                    </div>
                                    <span className="li-name">Dictionary &amp; Set</span>
                                    <FontAwesomeIcon icon={faGripVertical} className="li-drag" />
                                </div>
                                <div className="lesson-item" >
                                    <div className="li-type-dot" style={{ background: "#F1EFE8" }}>
                                        <i className="ti ti-code" style={{ color: "#444441", fontSize: "11px" }} aria-hidden="true"></i>
                                    </div>
                                    <span className="li-name">Bài tập thực hành</span>
                                    <FontAwesomeIcon icon={faGripVertical} className="li-drag" />
                                </div>
                            </div>
                            <div className="add-lesson-row">
                                <button className="add-lesson-btn" >
                                    <FontAwesomeIcon icon={faPlus} className="text-xs" />Thêm bài học
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="chapter-block">
                        <div className="ch-header" >
                            <i className="ti ti-chevron-right ch-icon open" id="ch-icon-3" aria-hidden="true"></i>
                            <span className="ch-name">Hàm &amp; Module</span>
                            <span className="ch-count">2</span>
                        </div>
                        <div id="ch-lessons-3">
                            <div className="lesson-list">

                                <div className="lesson-item" >
                                    <div className="li-type-dot" style={{ background: "#E1F5EE" }}>
                                        <i className="ti ti-player-play" style={{ color: "#085041", fontSize: "11px" }} aria-hidden="true"></i>
                                    </div>
                                    <span className="li-name">Định nghĩa hàm</span>
                                    <FontAwesomeIcon icon={faGripVertical} className="li-drag" />
                                </div>
                                <div className="lesson-item" >
                                    <div className="li-type-dot" style={{ background: "#E6F1FB" }}>
                                        <i className="ti ti-article" style={{ color: "#0C447C", fontSize: "11px" }} aria-hidden="true"></i>
                                    </div>
                                    <span className="li-name">Import module</span>
                                    <FontAwesomeIcon icon={faGripVertical} className="li-drag" />
                                </div>
                            </div>
                            <div className="add-lesson-row">
                                <button className="add-lesson-btn" >
                                    <FontAwesomeIcon icon={faPlus} className="text-xs" />Thêm bài học
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

const fastEditorButtons = [
    { ...TEXT_EDITOR_TOOLBAR_BUTTONS.HISTORY },
    { ...TEXT_EDITOR_TOOLBAR_BUTTONS.FORMATTING },
    { ...TEXT_EDITOR_TOOLBAR_BUTTONS.ALIGN },
    { 'IMAGE': TEXT_EDITOR_TOOLBAR_BUTTONS.INSERT.IMAGE },
    { ...TEXT_EDITOR_TOOLBAR_BUTTONS.CLEAR }
]

const RenderVideoForm = () => {
    const fileRef = useRef();
    const [dragging, setDragging] = useState(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        //handleThumbnailChange(e.dataTransfer.files);
    };
    return <div className="section-card p-4">
        <div className="section-title section-color-4">
            <FontAwesomeIcon icon={faPlay} />
            Nội dung video
        </div>
        <div className="form-grid gap-4">
            <div className={`form-full thumb-upload ${dragging && '!border-gray-700'}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={_ => fileRef.current?.click()}
            >
                <div className="thumb-icon">↑</div>
                <div className="thumb-label">Kéo thả hoặc chọn video</div>
                <div className="thumb-hint">{VIDEO_ALLOWED_TYPE.join(', ').toUpperCase()} · Tối đa {VIDEO_MAXIMUM_SIZE_MB}MB</div>
                <input ref={fileRef} type="file" accept="video/*" onChange={e => { }} className="hidden" />
            </div>
            <div className="field ">
                <label>Chất lượng mặc định</label>
                <select><option>720p</option><option>1080p</option><option>480p</option><option>Auto</option></select>
            </div>
            <div className="field">
                <label>Phụ đề</label>
                <select><option>Không có</option><option>Tiếng Việt</option><option>English</option></select>
            </div>
            <div className="field form-full">
                <label>Ghi chú / tóm tắt video</label>
                <textarea rows="2" placeholder="Tóm tắt những điểm chính trong video..."></textarea>
            </div>
        </div>
    </div>
}

const RenderTestForm = () => {
    const { openPopupTextEditor } = useOutletContext();
    const [question, setQuestion] = useState({})
    const editor = useEditor(buildEditorConfig(fastEditorButtons, {
        editable: true, 
        content: question.content || '', 
        placeholder: "Soạn thảo nội dung câu hỏi", 
        onChange: (newContent) => {
            setQuestion(prev => ({ ...prev, content: newContent }))
        }
    }));
    const handleOpenPopupTextEditor = (content, handleSave) => {
        openPopupTextEditor(content, handleSave, fastEditorButtons)
    }
    return <div className="section-card p-4">
        <div className="section-title section-color-4">
            <FontAwesomeIcon icon={faListCheck} />
            Bài kiểm tra
        </div>
        <div className="form-grid gap-4">
            <div className="field">
                <label className="">Loại câu hỏi <span style={{ 'color': 'var(--color-text-danger,#E24B4A)' }}>*</span></label>
                <select
                    placeholder="Loại câu hỏi"
                    className={``}
                    onChange={(e) => { setQuestion(prev => ({ ...prev, type: e.target.value })) }}
                    value={question.type}
                >
                    <option value=''>Chọn loại</option>
                    {
                        Object.keys(QUESTION_TYPE).map((key, index) => {
                            const type = QUESTION_TYPE[key];
                            return <option key={index} value={type.id}>{type.name}</option>
                        })
                    }
                </select>
            </div>
            <div className="field">
                <label>Điểm <span style={{ 'color': 'var(--color-text-danger,#E24B4A)' }}>*</span></label>
                <input type="number" placeholder="10" min="0" id="max-score" />
            </div>
            <div className="field form-full form-question-content">
                <label className="flex flex-row justify-between">
                    <span>Nội dung câu hỏi <span style={{ 'color': 'var(--color-text-danger,#E24B4A)' }}>*</span></span>
                    <button type='button' onClick={_ => handleOpenPopupTextEditor(question.content, (newContent) => {
                        editor.commands.setContent(newContent);
                        setQuestion(prev => ({ ...prev, content: newContent }))
                    })} className='cursor-pointer hover:opacity-80 text-right' >
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className='text-gray-700' style={{ fontSize: '14px' }} />
                    </button>
                </label>
                <div className="text-editor border rounded-lg max-h-[60vh] overflow-auto" style={{ border: ' 1px solid var(--color-border-secondary)' }}>
                    <EditorContent editor={editor} className="!outline-none px-2"
                        onMouseDown={(e) => {
                            const target = e.target;

                            if (target?.tagName === "IMG") {
                                e.stopPropagation();
                            }
                        }} />
                </div>
            </div>
            <div className="field form-full">
                <label>Câu trả lời <span style={{ 'color': 'var(--color-text-danger,#E24B4A)' }}>*</span></label>
                <input type="number" placeholder="10" min="0" id="max-score" />
            </div>
        </div>
    </div>
}

export default LessonIndex;