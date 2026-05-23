import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import './style.css';
import { useEffect, useState } from 'react';
import { formatDate, formatNumber, hasData, isArray, isFunction } from '../../../helper/utils';
import { COURSE_TYPE, DIFFICULT, LANGUAGE, PAGE_LOCATION } from '../../../define/define';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowUpRightFromSquare, faBookOpen, faComment, faCommentDots, faEdit, faInfo, faInfoCircle, faLightbulb, faTrash } from '@fortawesome/free-solid-svg-icons';
import { getCourseById, removeCourse } from '../../../service/CourseService';
import { toast } from 'react-toastify';
const CourseDetail = () => {
    const navigate = useNavigate();
    const {
        handleReset,
        setTitle,
        setIsMainFull,
        setControllers,
        openPopupConfirmAlert,
        setBgColor
    } = useOutletContext();
    const { courseId } = useParams();
    const [course, setCourse] = useState({})
    useEffect(() => {
        setTitle?.('Chi tiết khóa học')
        setIsMainFull?.(true)
        getCourseById(courseId)
            .then(res => {
                setCourse(res.data.data)
            })
            .catch(_ => { })
        return () => {
            handleReset?.();
        }
    }, [courseId])
    const handleRemoveCourse = (ids) => {
        if (!hasData(ids) || !isArray(ids)) return;
        openPopupConfirmAlert({
            type: 'warning',
            title: 'Xác nhận xóa',
            label: 'Bản ghi sẽ bị xóa vĩnh viễn, bạn có chắc muốn xóa?',
            onAccept: () => {
                removeCourse(ids)
                    .then(_ => {
                        toast.success('Xóa thành công!');
                        navigate(PAGE_LOCATION.ADMIN_MANAGEMENT_COURSE)
                    })
                    .catch(_ => { })
            }
        })
    }
    return (<div id="detail-pg" className=" p-4">
        <div className="topbar !items-start p-4 section-card flex-col flex-wrap xs:flex-row">
            <button type='button' className="back-btn" onClick={() => navigate(PAGE_LOCATION.ADMIN_MANAGEMENT_COURSE)}>
                <FontAwesomeIcon icon={faArrowLeft} />Danh sách
            </button>
            <div className="det-title-block">
                <div className="det-title capitalize" id="det-name">{course.name}</div>
                <div className="det-breadcrumb capitalize">{course.description}</div>
            </div>
            <div className="det-actions">
                <button type='button' className="btn-edit" onClick={_ => navigate(`${PAGE_LOCATION.ADMIN_UPDATE_COURSE}?id=${course?.id}`)} ><FontAwesomeIcon icon={faEdit} />Chỉnh sửa</button>
                <button type='button' className="btn-danger-sm" onClick={_ => handleRemoveCourse([course?.id])}><FontAwesomeIcon icon={faTrash} /></button>
            </div>
        </div>
        <hr className='my-4'></hr>
        {hasData(course.id) && <div id="det-content" className='!gap-4 space-y-4'>
            <div className="det-hero !flex-wrap !flex-row !bg-white">
                <div className="det-thumb !w-full md:!w-60 !h-auto" style={{ background: '#EEEDFE' }}>
                    <img className='max-w-full max-h-full aspect-square object-cover rounded' src={course.thumbnail || "/img/course-img-default.jpg"} alt='course-image' />
                </div>
                <div className="det-hero-info">
                    <div className="det-hero-name text-wrap break-words capitalize">{course.name}</div>
                    <div className="det-hero-desc text-wrap break-words capitalize">{course.description}</div>
                    <div className="det-hero-tags">
                        {course.tags?.map((tag, index) => <span key={index} className="tag-pill">{tag}</span>)}
                    </div>
                </div>
            </div>

            <div className="det-stats !gap-4 !grid-cols-2 sm:!grid-cols-4">
                <div className="stat-card"><div className="stat-label">Học viên</div><div className="stat-val">0</div><div className="stat-sub"></div></div>
                <div className="stat-card"><div className="stat-label">Đánh giá</div><div className="stat-val">—</div><div className="stat-sub">0 nhận xét</div></div>
                <div className="stat-card"><div className="stat-label">Doanh thu</div><div className="stat-val">0đ</div><div className="stat-sub">Tổng cộng</div></div>
                <div className="stat-card"><div className="stat-label">Bài học</div><div className="stat-val">0</div><div className="stat-sub">0h nội dung</div></div>
            </div>

            <div className="det-two-col !gap-4 !grid-cols-1 sm:!grid-cols-2">
                <div className="det-card">
                    <div className="section-title section-color-4"><FontAwesomeIcon icon={faInfoCircle} style={{ fontSize: '14px' }} aria-hidden="true" />Thông tin chi tiết</div>
                    <div className="info-row"><span className="info-key">Lĩnh vực</span><span className="info-val">{course.sector.name}</span></div>
                    <div className="info-row"><span className="info-key">Chủ đề</span><span className="info-val">{course.topic.name}</span></div>
                    <div className="info-row"><span className="info-key">Ngôn ngữ</span><span className="info-val">{LANGUAGE[course.language]}</span></div>
                    <div className="info-row"><span className="info-key">Độ khó</span><span className="info-val">{DIFFICULT[course.difficult]}</span></div>
                    <div className="info-row"><span className="info-key">Giá</span><span className="info-val"><span style={{ fontWeight: '500' }}>{course.type === 'FREE' ? COURSE_TYPE[course.type] : `${formatNumber(course.price)}đ`}</span></span></div>
                    <div className="info-row"><span className="info-key">Chứng chỉ</span><span className="info-val">{course.issuingCertificate === true ? 'Có' : 'Không'}</span></div>
                    <div className="info-row"><span className="info-key">Ngày tạo</span><span className="info-val">{formatDate(course.createdTime)}</span></div>
                    {hasData(course.lstRequiredKnowledge) && <div className="info-row !flex-row det-hero-tags !pb-0"><span className="w-full">Kiến thức cần có </span><div className='det-hero-tags'>{course.lstRequiredKnowledge?.map((tag, index) => <span key={index} className="tag-pill">{tag}</span>)}</div></div>}
                </div>
                <div className="det-card">
                    <div className="section-title section-color-4 relative"><FontAwesomeIcon icon={faBookOpen} style={{ fontSize: '14px' }} aria-hidden="true" />
                        Chương trình học
                        <button type='button' onClick={_ => navigate(PAGE_LOCATION.ADMIN_MANAGEMENT_LESSON(course?.id))} className='cursor-pointer hover:opacity-80' title='Chỉnh sửa' ><FontAwesomeIcon icon={faArrowUpRightFromSquare} className='absolute right-0 top-0' style={{ fontSize: '14px' }} /></button>
                    </div>
                    <div className="curriculum-list">
                        <div className="chapter-item">
                            <span className="chapter-name">Mindset khởi nghiệp</span>
                            <span className="chapter-meta">4 bài · 60p</span>
                        </div>
                        <div className="chapter-item">
                            <span className="chapter-name">Market Research</span>
                            <span className="chapter-meta">6 bài · 95p</span>
                        </div>
                        <div className="chapter-item">
                            <span className="chapter-name">Business Model</span>
                            <span className="chapter-meta">7 bài · 110p</span>
                        </div>
                        <div className="chapter-item">
                            <span className="chapter-name">MVP &amp; Validation</span>
                            <span className="chapter-meta">8 bài · 130p</span>
                        </div>
                        <div className="chapter-item">
                            <span className="chapter-name">Gọi vốn đầu tư</span>
                            <span className="chapter-meta">6 bài · 95p</span>
                        </div>
                        <div className="chapter-item">
                            <span className="chapter-name">Scale &amp; Growth</span>
                            <span className="chapter-meta">5 bài · 80p</span>
                        </div></div>
                </div>
            </div>

            {hasData(course.suggestCourses) && <div className="det-card">
                <div className="section-title section-color-4"><FontAwesomeIcon icon={faLightbulb} style={{ fontSize: '14px' }} />Gợi ý khóa học</div>
                <div className='w-full overflow-auto'>
                    <div className='flex flex-row flex-nowrap space-x-2 w-auto'>
                        {course.suggestCourses.map((suggest, index) => <div key={index} onClick={e => { e.stopPropagation(); navigate(PAGE_LOCATION.ADMIN_DETAIL_COURSE(suggest.id)) }} className='max-w-60 min-w-60 rounded-lg overflow-hidden shadow-sm cursor-pointer border' title={suggest.name + "\n" + suggest.description}>
                            <div className='w-full h-32'>
                                <img className='w-full max-w-full max-h-full object-cover' src={suggest.thumbnail || "/img/course-img-default.jpg"} alt='course-image' />
                            </div>
                            <div className='p-2 text-ellipsis overflow-hidden text-nowrap '>
                                <p className='text-sm text-gray-700 text-ellipsis overflow-hidden uppercase'>{suggest.name}</p>
                                <p className='text-xs text-gray-500 text-ellipsis overflow-hidden capitalize'>{suggest.description}</p>
                                <span className={`diff-badge d-${String(suggest.difficult).toLowerCase()}`}>{DIFFICULT[suggest.difficult]}</span>
                            </div>
                        </div>)}
                    </div>
                </div>
            </div>}

            <div className="det-card">
                <div className="section-title section-color-4"><FontAwesomeIcon icon={faCommentDots} style={{ fontSize: '14px' }} aria-hidden="true" />Nhận xét học viên</div>
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-tertiary)' }}><i className="ti ti-message-off" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }} aria-hidden="true"></i>Chưa có nhận xét nào</div>
            </div>
        </div>
        }
    </div>)
}

export default CourseDetail;