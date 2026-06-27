import { useEffect, useState } from "react";
import {
    ArrowLeft, Users, BookOpen, Clock, User, Calendar, PlayCircle, Lock,
    CheckCircle2, ChevronDown, Award, Smartphone, Infinity as InfinityIcon,
    Download, FileText, Target, ListChecks, Video, Check, ShoppingCart,
    GraduationCap, Globe, BarChart3,
    FolderOpen,
    List,
    Play,
    Lightbulb,
} from "lucide-react";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen, faStar, faStarHalfStroke } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { DIFFICULT, LANGUAGE, PAGE_LOCATION } from "../../define/define";
import { getCourseDetailById, subscribeCourse } from "../../service/CourseService";
import { caculatorPrice, formatNumber, getUserInfo, promotionDisplay } from "../../helper/utils";
import { toast } from "react-toastify";

const fmtDur = (m) => (m >= 60 ? `${Math.floor(m / 60)}g ${m % 60}ph` : `${m} phút`);

function StarRating({ value, className = "" }) {
    const full = Math.floor(value);
    const half = value - full >= 0.5;
    return (
        <span className={`inline-flex items-center gap-0.5 text-amber-400 ${className}`}>
            {[0, 1, 2, 3, 4].map((i) => {
                if (i < full) return <FontAwesomeIcon key={i} icon={faStar} />;
                if (i === full && half) return <FontAwesomeIcon key={i} icon={faStarHalfStroke} />;
                return <FontAwesomeIcon key={i} icon={faStar} className="text-slate-300" />;
            })}
        </span>
    );
}

function SectionCard({ icon: Icon, iconColor, title, children }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800">
                <Icon size={18} style={{ color: iconColor }} />
                {title}
            </div>
            {children}
        </div>
    );
}

export default function CourseDetail() {
    const { setTitle, setIsMainFull, openPopupConfirmAlert } = useOutletContext()
    const navigate = useNavigate()
    const [enrolled, setEnrolled] = useState(false);
    const [openChapters, setOpenChapters] = useState(() => new Set([1]));
    const [course, setCourse] = useState({});
    const { courseId } = useParams();
    const canAccess = (lesson) => enrolled && lesson.canPreview;
    const user = getUserInfo();

    useEffect(() => {
        setTitle?.('Chi tiết khóa học');
        setIsMainFull?.(true);
    }, [])

    useEffect(() => {
        getCourseDetailById(courseId)
            .then(res => {
                const c = res.data.data;
                setCourse(c);
                setTitle?.(c.name);
                if (c.subscribe?.userId === user.id)
                    setEnrolled(true)
            })
            .catch(() => { })
    }, [courseId])

    const toggleChapter = (id) =>
        setOpenChapters((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const handleSubscribeCourse = () => {
        const callback = () =>
            subscribeCourse(courseId)
                .then(res => {
                    const sub = res.data.data;
                    setCourse(prev => ({ ...prev, subscribe: sub }));
                    setEnrolled(true);
                    toast.success('Đăng ký khóa học thành công!')
                })
                .catch(() => { })

        openPopupConfirmAlert({
            type: 'info',
            title: 'Xác nhận đăng ký',
            label: 'Bạn có chắc muốn đăng ký khóa học?',
            onAccept: callback
        })
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-5 text-slate-700">
            <div className="mx-auto max-w-6xl">

                <div className="mb-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate?.(PAGE_LOCATION.USER_COURSE_INDEX)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-slate-600 transition hover:bg-slate-200/60"
                    >
                        <ArrowLeft size={16} /> Danh sách khóa học
                    </button>
                </div>

                {course?.id && <div>
                    <div className="flex flex-row gap-4 bg-white p-5 rounded-2xl border border-slate-200 flex-wrap @sm:flex-nowrap">
                        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl w-full max-w-full @sm:max-w-sm">
                            <img src={course.thumbnail || '/img/course-img-default.jpg'} alt={course.name} className="h-full w-full object-cover" />
                            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                                <span className="rounded-full bg-[#FAECE7] px-2 py-0.5 text-sm font-semibold text-[#712B13]">
                                    {DIFFICULT[course.difficult]}
                                </span>
                                {course.issuingCertificate && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FAEEDA] px-2 py-0.5 text-sm font-semibold text-[#854F0B]">
                                        <Award size={11} /> Chứng chỉ
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <div className="mb-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                                <FontAwesomeIcon className="text-xs" icon={faFolderOpen} />
                                <span>{course.sector.name} · {course.topic.name}</span>
                            </div>
                            <h1 className="text-2xl font-bold leading-snug text-slate-900">{course.name}</h1>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">{course.description}</p>
                            <div className="mt-3 flex items-center gap-2 text-sm">
                                <StarRating value={course.countEvaluate > 0 ? course.evaluate : 5} />
                                <span className="font-semibold text-amber-600">{(course.countEvaluate > 0 ? course.evaluate : 5).toFixed(1)}</span>
                                <span className="text-slate-400">({course.countEvaluate} đánh giá)</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1.5"><Users size={15} /> {(course.countSubscribe || 0).toLocaleString("vi-VN")} học viên</span>
                                <span className="inline-flex items-center gap-1.5"><BookOpen size={15} /> {course.countLesson} bài học</span>
                                <span className="inline-flex items-center gap-1.5"><Clock size={15} /> {fmtDur(course.totalTime)}</span>
                                <span className="inline-flex items-center gap-1.5"><User size={15} /> {course.professorName}</span>
                                <span className="inline-flex items-center gap-1.5"><Calendar size={15} /> Cập nhật {dayjs(course.updatedAt).format("DD/MM/YYYY")}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 @md:grid-cols-[1fr_360px]">

                        <div className="flex flex-col gap-4">
                            {/* {enrolled && (
                                <div className="rounded-2xl border border-[#185FA5]/20 bg-[#185FA5]/[0.04] p-5">
                                    <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                                        <span className="inline-flex items-center gap-1.5"><GraduationCap size={16} style={{ color: PRIMARY }} /> Tiến độ học tập</span>
                                        <span>{completedCount}/{totalLessons} bài • {progressPct}%</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                        <div className="h-full rounded-full bg-gradient-to-r from-[#185FA5] to-[#3b8fd4] transition-all" style={{ width: `${progressPct}%` }} />
                                    </div>
                                    {nextLesson && (
                                        <p className="mt-2.5 text-xs text-slate-500">
                                            Tiếp theo: <span className="font-medium text-slate-700">{nextLesson.title}</span>
                                        </p>
                                    )}
                                </div>
                            )} */}

                            <SectionCard icon={User} iconColor="#185FA5" title="Giảng viên">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#185FA5]/10 text-lg font-semibold text-[#185FA5]">
                                        {course.professorName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-800">{course.professorName}</div>
                                    </div>
                                </div>
                            </SectionCard>


                            <SectionCard icon={FileText} iconColor="#534AB7" title="Mô tả khóa học">
                                <div className="flex flex-col gap-2.5">
                                    <p className="text-sm leading-relaxed text-slate-600">{course.description}</p>
                                </div>
                            </SectionCard>

                            <SectionCard icon={Target} iconColor="#185FA5" title="Bạn sẽ học được gì">
                                {course.tags?.length > 0 && <ul className="grid grid-cols-1 gap-2.5 @sm:grid-cols-2">
                                    {course.tags?.map((o, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                            <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                                <Check size={11} strokeWidth={3} />
                                            </span>
                                            {o}
                                        </li>
                                    ))}
                                </ul>}
                                {!course.tags?.length && <p className="text-sm text-slate-600">Không có kiến thức đạt được!</p>}
                            </SectionCard>

                            <SectionCard icon={ListChecks} iconColor="#854F0B" title="Yêu cầu kiến thức trước khi học">
                                {course.lstRequiredKnowledge?.length > 0 && <ul className="flex flex-col gap-2">
                                    {course.lstRequiredKnowledge?.map((r, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-300" />
                                            {r}
                                        </li>
                                    ))}
                                </ul>}
                                {!course.lstRequiredKnowledge?.length && <p className="text-sm text-slate-600">Không có yêu cầu kiến thức!</p>}
                            </SectionCard>

                            <SectionCard icon={Lightbulb} iconColor="#AA5993" title="Gợi ý khóa học">
                                {course.suggestCourses?.length > 0 && <div className='w-full overflow-auto'>
                                    <div className='flex flex-row flex-nowrap space-x-2 w-auto'>
                                        {course.suggestCourses.map((suggest, index) => <div key={index} onClick={e => { e.stopPropagation(); navigate(PAGE_LOCATION.USER_COURSE_DETAIL(suggest.id)) }} className='max-w-60 min-w-60 rounded-lg overflow-hidden shadow-sm cursor-pointer border border-color-tertiary' title={suggest.name + "\n" + suggest.description}>
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
                                }
                                {!course.suggestCourses?.length && <p className="text-sm text-slate-600">Không có khóa học gợi ý!</p>}
                            </SectionCard>
                        </div>

                        <div className="flex flex-col gap-4">

                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                {enrolled ? (
                                    <>
                                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
                                            <CheckCircle2 size={14} /> Đã đăng ký
                                        </div>
                                        <button
                                            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition bg-color-accent hover:opacity-80"
                                        >
                                            <Play size={18} /> Tiếp tục học
                                        </button>
                                        {/* <button
                                            className="mt-2 w-full rounded-xl border border-slate-200 py-2 text-sm text-slate-500 transition hover:bg-slate-50 font-semibold"
                                        >
                                            Hủy đăng ký
                                        </button> */}
                                    </>
                                ) : (
                                    <>
                                        {course.type === 'PAID' &&
                                            <div className="mb-2 gap-2">
                                                {course.promotion > 0 && <>
                                                    <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-xs font-semibold text-rose-600 text-nowrap">SALE OF {promotionDisplay(course.promotion, course.promotionType)}</span>
                                                    <br></br>
                                                </>}
                                                <div className="flex items-baseline gap-2 flex-wrap">
                                                    <span className="text-xl font-bold text-slate-900 text-nowrap">{formatNumber(Math.ceil(caculatorPrice(course.price, course.promotion, course.promotionType) || 0))} VNĐ</span>
                                                    {course.promotion > 0 && (
                                                        <>
                                                            <span className="text-sm text-slate-400 line-through text-nowrap">{formatNumber(course.price)} VNĐ</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        }

                                        {course.type === 'FREE' ? (
                                            <button
                                                onClick={handleSubscribeCourse}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition bg-color-accent hover:opacity-80"
                                            >
                                                Đăng ký miễn phí
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition bg-color-accent hover:opacity-80"
                                                >
                                                    Mua ngay
                                                </button>
                                                <button
                                                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-color-accent py-2.5 text-sm font-semibold text-color-accent transition hover:bg-[#185FA5]/5"
                                                >
                                                    <ShoppingCart size={16} /> Thêm vào giỏ hàng
                                                </button>
                                                <p className="mt-2.5 text-center text-xs text-slate-400">Hoàn tiền trong 7 ngày nếu không hài lòng</p>
                                            </>
                                        )}
                                    </>
                                )}

                                <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-2.5"><List size={15} className="text-slate-400" /> Đa dạng bài học</div>
                                    <div className="flex items-center gap-2.5"><Smartphone size={15} className="text-slate-400" /> Truy cập trên mọi thiết bị</div>
                                    <div className="flex items-center gap-2.5"><InfinityIcon size={15} className="text-slate-400" /> Truy cập vĩnh viễn</div>
                                    <div className="flex items-center gap-2.5"><Globe size={15} className="text-slate-400" /> Ngôn ngữ: {LANGUAGE[course.language]}</div>
                                    {course.issuingCertificate && <div className="flex items-center gap-2.5"><Award size={15} className="text-[#854F0B]" /> Cấp chứng chỉ hoàn thành</div>}
                                    <div className="flex items-center gap-2.5"><Download size={15} className="text-slate-400" /> Tài liệu có thể tải về</div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white">
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                                    <span className="inline-flex items-center gap-2 text-base font-semibold text-slate-800">
                                        <BarChart3 size={18} style={{ color: '#185FA5' }} /> Nội dung khóa học
                                    </span>
                                    <span className="text-xs text-slate-400">{course.chapters?.length || 0} chương · {course.countLesson} bài</span>
                                </div>

                                {course.chapters?.length > 0 && <div className="divide-y divide-slate-100">
                                    {course.chapters?.map((ch, chI) => {
                                        const open = openChapters.has(ch.id);
                                        const chMin = ch.totalTime;
                                        return (
                                            <div key={ch.id}>
                                                <button
                                                    title={ch.name}
                                                    onClick={() => toggleChapter(ch.id)}
                                                    aria-expanded={open}
                                                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-50"
                                                >
                                                    <ChevronDown size={16} className={`flex-shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                                                    <span className="flex-1 text-sm font-medium text-slate-800 max-w-full text-nowrap overflow-hidden text-ellipsis">{ch.name}</span>
                                                    <span className="flex-shrink-0 text-xs text-slate-400">{ch.totalLesson} bài · {fmtDur(chMin)}</span>
                                                </button>

                                                <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                                                    <div className="overflow-hidden">
                                                        {ch.lessons?.length > 0 && <ul className="pb-1">
                                                            {ch.lessons.map((l, lI) => {
                                                                const accessible = canAccess(l) || (l.canPreview === true) || (enrolled && lI === 0 && chI === 0);
                                                                const done = enrolled && l.completed;
                                                                return (
                                                                    <li key={l.id} title={l.name}>
                                                                        <button
                                                                            onClick={e => navigate(PAGE_LOCATION.USER_LEARN_LESSON(courseId, l.id))}
                                                                            disabled={!accessible}
                                                                            title={accessible ? l.name : "Đăng ký để mở khóa bài học này"}
                                                                            className={`flex w-full items-center gap-2.5 px-5 py-2 pl-12 text-left text-sm transition ${accessible ? "text-slate-600 hover:bg-slate-50 hover:text-[#185FA5]" : "cursor-not-allowed text-slate-400"
                                                                                }`}
                                                                        >
                                                                            {(done) ? (
                                                                                <CheckCircle2 size={15} className="flex-shrink-0 text-emerald-500" />
                                                                            ) : accessible ? (
                                                                                <Play size={15} className="flex-shrink-0 text-[#185FA5]" />
                                                                            ) : (
                                                                                <Lock size={14} className="flex-shrink-0 text-slate-300" />
                                                                            )}
                                                                            <span className="flex-1 truncate">{l.name}</span>
                                                                            <span className="flex-shrink-0 text-xs text-slate-400">{l.duration}ph</span>
                                                                        </button>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>}
                                                        {!ch.lessons?.length && <p className="text-sm text-slate-600 px-5 py-2 pl-12 text-left transition">Chưa có bài học nào!</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                }
                                {!course.chapters?.length && <p className="text-sm text-slate-600 px-5 py-3.5">Chưa có bài học nào!</p>}
                            </div>
                        </div>
                    </div>
                </div>}
            </div>
        </div >
    );
}
