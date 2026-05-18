import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import '../style.css';
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faPlus, faSave } from "@fortawesome/free-solid-svg-icons";
import { PAGE_LOCATION } from "../../../../define/define";
import { getCourseById } from "../../../../service/CourseService";
const lessonTypes = [
    {
        type: "article",
        label: "Bài viết",
        icon: "ti ti-article",
        bg: "#E6F1FB",
        color: "#0C447C",
    },
    {
        type: "video",
        label: "Video",
        icon: "ti ti-player-play",
        bg: "#E1F5EE",
        color: "#085041",
    },
    {
        type: "mcq",
        label: "Trắc nghiệm",
        icon: "ti ti-list-check",
        bg: "#EEEDFE",
        color: "#3C3489",
    },
    {
        type: "fill",
        label: "Điền khuyết",
        icon: "ti ti-forms",
        bg: "#FAEEDA",
        color: "#633806",
    },
    {
        type: "code",
        label: "Lập trình",
        icon: "ti ti-code",
        bg: "#F1EFE8",
        color: "#444441",
    },
    {
        type: "quiz",
        label: "Tự luận",
        icon: "ti ti-pencil",
        bg: "#FBEAF0",
        color: "#72243E",
    },
    {
        type: "slide",
        label: "Slide",
        icon: "ti ti-presentation",
        bg: "#EAF3DE",
        color: "#27500A",
    },
    {
        type: "file",
        label: "Tài liệu",
        icon: "ti ti-file-download",
        bg: "#FAECE7",
        color: "#712B13",
    },
    {
        type: "survey",
        label: "Khảo sát",
        icon: "ti ti-clipboard-list",
        bg: "#E6F1FB",
        color: "#0C447C",
    },
    {
        type: "live",
        label: "Live",
        icon: "ti ti-broadcast",
        bg: "#FCEBEB",
        color: "#791F1F",
    },
];
const LessonIndex = () => {
    const { courseId } = useParams();
    const {
        handleReset,
        setTitle,
        setIsMainFull,
        setControllers,
        openConfirmAlert,
        setBgColor } = useOutletContext();
    const navigate = useNavigate();
    const [course, setCourse] = useState({})
    useEffect(() => {
        setTitle?.('Quản lý bài học')
        setIsMainFull?.(true)
        setBgColor('bg-white')
        getCourseById(courseId)
            .then(res => {
                setCourse(res.data.data)
            })
            .catch(_ => { })
        return () => {
            handleReset?.()
        }
    }, [courseId])

    const [selectedType, setSelectedType] = useState("video");

    return <div className="wrap bg-white p-4">
        <div className="topbar !items-start">
            <button className="back-btn" type="button" onClick={_ => navigate(PAGE_LOCATION.ADMIN_DETAIL_COURSE(courseId))} ><FontAwesomeIcon icon={faArrowLeft} />Khóa học</button>
            <div className="det-title-block">
                <div className="det-title capitalize" id="det-name">{course.name}</div>
                <div className="det-breadcrumb capitalize">{course.description}</div>
            </div>
            <div>
                <button type="button" className="btn-pub !bg-gray-700"><FontAwesomeIcon icon={faCheck} />Lưu</button>
            </div>
        </div>

        <div className="layout">

            <div className="sidebar">
                <div className="sb-head">
                    <span className="sb-head-label">Chương trình học</span>
                    <button className="sb-add-ch" onclick="addChapter()"><i className="ti ti-plus" aria-hidden="true"></i>Thêm
                        chương</button>
                </div>
                <div id="chapter-tree">
                    <div className="chapter-block">
                        <div className="ch-header" onclick="toggleChapter(1)">
                            <i className="ti ti-chevron-right ch-icon open" id="ch-icon-1" aria-hidden="true"></i>
                            <span className="ch-name">Giới thiệu Python</span>
                            <span className="ch-count">3</span>
                        </div>
                        <div id="ch-lessons-1" >
                            <div className="lesson-list">

                                <div className="lesson-item active" onclick="setActiveLesson(1,1)">
                                    <div className="li-type-dot" style={{ background: "#E1F5EE" }}>
                                        <i className="ti ti-player-play" style={{ color: "#085041", fontSize: "11px" }} aria-hidden="true"></i>
                                    </div>
                                    <span className="li-name">Python là gì?</span>
                                    <i className="ti ti-grip-vertical li-drag" aria-hidden="true"></i>
                                </div>
                                <div className="lesson-item" onclick="setActiveLesson(1,2)">
                                    <div className="li-type-dot" style={{ background: "#E6F1FB" }}>
                                        <i className="ti ti-article" style={{ color: "#0C447C", fontSize: "11px" }} aria-hidden="true"></i>
                                    </div>
                                    <span className="li-name">Cài đặt môi trường</span>
                                    <i className="ti ti-grip-vertical li-drag" aria-hidden="true"></i>
                                </div>
                                <div className="lesson-item" onclick="setActiveLesson(1,3)">
                                    <div className="li-type-dot" style={{ background: "#EEEDFE" }}>
                                        <i className="ti ti-list-check" style={{ color: "#3C3489", fontSize: "11px" }} aria-hidden="true"></i>
                                    </div>
                                    <span className="li-name">Kiểm tra bài 1</span>
                                    <i className="ti ti-grip-vertical li-drag" aria-hidden="true"></i>
                                </div>
                            </div>
                            <div className="add-lesson-row">
                                <button className="add-lesson-btn" onclick="addLesson(1)">
                                    <i className="ti ti-plus" aria-hidden="true"></i>Thêm bài học
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="chapter-block">
                        <div className="ch-header" onclick="toggleChapter(2)">
                            <i className="ti ti-chevron-right ch-icon open" id="ch-icon-2" aria-hidden="true"></i>
                            <span className="ch-name">Cấu trúc dữ liệu</span>
                            <span className="ch-count">3</span>
                        </div>
                        <div id="ch-lessons-2" >
                            <div className="lesson-list">

                                <div className="lesson-item" onclick="setActiveLesson(2,4)">
                                    <div className="li-type-dot" style={{ background: "#E1F5EE" }}>
                                        <i className="ti ti-player-play" style={{ color: "#085041", fontSize: "11px" }} aria-hidden="true"></i>
                                    </div>
                                    <span className="li-name">List và Tuple</span>
                                    <i className="ti ti-grip-vertical li-drag" aria-hidden="true"></i>
                                </div>
                                <div className="lesson-item" onclick="setActiveLesson(2,5)">
                                    <div className="li-type-dot" style={{ background: "#E6F1FB" }}>
                                        <i className="ti ti-article" style={{ color: "#0C447C", fontSize: "11px" }} aria-hidden="true"></i>
                                    </div>
                                    <span className="li-name">Dictionary &amp; Set</span>
                                    <i className="ti ti-grip-vertical li-drag" aria-hidden="true"></i>
                                </div>
                                <div className="lesson-item" onclick="setActiveLesson(2,6)">
                                    <div className="li-type-dot" style={{ background: "#F1EFE8" }}>
                                        <i className="ti ti-code" style={{ color: "#444441", fontSize: "11px" }} aria-hidden="true"></i>
                                    </div>
                                    <span className="li-name">Bài tập thực hành</span>
                                    <i className="ti ti-grip-vertical li-drag" aria-hidden="true"></i>
                                </div>
                            </div>
                            <div className="add-lesson-row">
                                <button className="add-lesson-btn" onclick="addLesson(2)">
                                    <i className="ti ti-plus" aria-hidden="true"></i>Thêm bài học
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="chapter-block">
                        <div className="ch-header" onclick="toggleChapter(3)">
                            <i className="ti ti-chevron-right ch-icon open" id="ch-icon-3" aria-hidden="true"></i>
                            <span className="ch-name">Hàm &amp; Module</span>
                            <span className="ch-count">2</span>
                        </div>
                        <div id="ch-lessons-3">
                            <div className="lesson-list">

                                <div className="lesson-item" onclick="setActiveLesson(3,7)">
                                    <div className="li-type-dot" style={{ background: "#E1F5EE" }}>
                                        <i className="ti ti-player-play" style={{ color: "#085041", fontSize: "11px" }} aria-hidden="true"></i>
                                    </div>
                                    <span className="li-name">Định nghĩa hàm</span>
                                    <i className="ti ti-grip-vertical li-drag" aria-hidden="true"></i>
                                </div>
                                <div className="lesson-item" onclick="setActiveLesson(3,8)">
                                    <div className="li-type-dot" style={{ background: "#E6F1FB" }}>
                                        <i className="ti ti-article" style={{ color: "#0C447C", fontSize: "11px" }} aria-hidden="true"></i>
                                    </div>
                                    <span className="li-name">Import module</span>
                                    <i className="ti ti-grip-vertical li-drag" aria-hidden="true"></i>
                                </div>
                            </div>
                            <div className="add-lesson-row">
                                <button className="add-lesson-btn" onclick="addLesson(3)">
                                    <i className="ti ti-plus" aria-hidden="true"></i>Thêm bài học
                                </button>
                            </div>
                        </div>
                    </div></div>
            </div>

            <div className="main-panel">

                <div className="type-picker">
                    <div className="tp-label">Loại bài học</div>
                    <div className="type-grid" id="type-grid">
                        {lessonTypes.map((item) => (
                            <button
                                key={item.type}
                                className={`type-card ${selectedType === item.type ? "selected" : ""
                                    }`}
                                onClick={() => setSelectedType(item.type)}
                            >
                                <div
                                    className="tc-icon"
                                    style={{ background: item.bg }}
                                >
                                    <i
                                        className={item.icon}
                                        style={{
                                            color: item.color,
                                            fontSize: "15px",
                                        }}
                                        aria-hidden="true"
                                    />
                                </div>

                                <span className="tc-label">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-card">
                    <div className="fc-head"><i className="ti ti-info-circle" aria-hidden="true"></i>Thông tin chung</div>
                    <div className="field">
                        <label>Tên bài học <span style={{ 'color': 'var(--color-text-danger,#E24B4A)' }}>*</span></label>
                        <input type="text" id="lesson-title" placeholder="Nhập tên bài học..." />
                    </div>
                    <div className="row2">
                        <div className="field">
                            <label>Thuộc chương</label>
                            <select id="lesson-chapter"><option value="1">Giới thiệu Python</option><option value="2">Cấu trúc dữ liệu</option><option value="3">Hàm &amp; Module</option></select>
                        </div>
                        <div className="field">
                            <label>Thứ tự trong chương</label>
                            <input type="number" id="lesson-order" value="1" min="1" />
                        </div>
                    </div>
                    <div className="field">
                        <label>Mô tả ngắn</label>
                        <textarea id="lesson-desc" rows="2" placeholder="Học viên sẽ học được gì trong bài này..."></textarea>
                    </div>
                </div>

                <div className="form-card" id="content-area">
                    <div className="fc-head"><i className="ti ti-player-play" style={{ color: "#0F6E56" }} aria-hidden="true"></i>Nội dung video</div>
                    <div className="video-zone flex flex-col items-center justify-center" style={{ minHeight: "140px" }}>
                        <i className="ti ti-video-plus vz-icon" aria-hidden="true"></i>
                        <div className="vz-label">Tải video lên hoặc dán link</div>
                        <div className="vz-hint">MP4, MOV, AVI · tối đa 2GB · 1080p khuyến nghị</div>
                    </div>
                    <div className="field" style={{ 'margin-top': '10px' }}>
                        <label>Hoặc dán link video</label>
                        <input type="url" placeholder="https://youtube.com/... hoặc https://vimeo.com/..." />
                    </div>
                    <div className="row2" style={{ 'margin-top': '10px' }}>
                        <div className="field">
                            <label>Chất lượng mặc định</label>
                            <select><option>720p</option><option>1080p</option><option>480p</option><option>Auto</option></select>
                        </div>
                        <div className="field">
                            <label>Phụ đề</label>
                            <select><option>Không có</option><option>Tiếng Việt</option><option>English</option></select>
                        </div>
                    </div>
                    <div className="field">
                        <label>Ghi chú / tóm tắt video</label>
                        <textarea rows="2" placeholder="Tóm tắt những điểm chính trong video..."></textarea>
                    </div></div>

                <div className="form-card">
                    <div className="fc-head"><i className="ti ti-settings" aria-hidden="true"></i>Cài đặt bài học</div>
                    <div className="settings-row" style={{ 'margin-bottom': '10px' }}>
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
                    </div>
                    <div style={{ 'gap': '7px' }} className="flex flex-col">
                        <div className="toggle-row" onclick="toggle(this)">
                            <div>
                                <div className="tg-info">Bắt buộc hoàn thành</div>
                                <div className="tg-sub">Học viên phải xong bài này mới mở bài tiếp</div>
                            </div>
                            <div className="sw on"></div>
                        </div>
                        <div className="toggle-row" onclick="toggle(this)">
                            <div>
                                <div className="tg-info">Cho phép xem trước</div>
                                <div className="tg-sub">Học viên chưa mua vẫn xem được bài này</div>
                            </div>
                            <div className="sw"></div>
                        </div>
                        <div className="toggle-row" onclick="toggle(this)">
                            <div>
                                <div className="tg-info">Hiển thị đáp án</div>
                                <div className="tg-sub">Hiện đáp án đúng sau khi nộp bài</div>
                            </div>
                            <div className="sw on" id="sw-answer"></div>
                        </div>
                        <div className="toggle-row" onclick="toggle(this)">
                            <div>
                                <div className="tg-info">Trộn câu hỏi</div>
                                <div className="tg-sub">Ngẫu nhiên thứ tự câu hỏi mỗi lần thi</div>
                            </div>
                            <div className="sw"></div>
                        </div>
                    </div>
                </div>

                <div className="action-bar">
                    <div className="action-left">
                        <button className="btn-prev"><i className="ti ti-arrow-left" aria-hidden="true"></i>Bài trước</button>
                        <span className="lesson-progress" id="lesson-prog">Bài 1 / 8</span>
                    </div>
                    <div className="flex" style={{ 'gap': '8px' }}>
                        <button className="btn-next">Bài tiếp theo<i className="ti ti-arrow-right" aria-hidden="true"></i></button>
                    </div>
                </div>

            </div>
        </div>
    </div>
}

export default LessonIndex;