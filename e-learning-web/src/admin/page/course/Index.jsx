import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowDownShortWide,
    faArrowDownWideShort,
    faBroom,
    faCircleInfo,
    faClose,
    faFilter,
    faPenToSquare,
    faPlus,
    faSearch,
    faTrash
} from "@fortawesome/free-solid-svg-icons";

import { deepEquals, formatDateTime, formatNumber, hasData, isArray, isFunction } from "../../../helper/utils";
import { COURSE_PRICE_RANGE, COURSE_SORT_BY, COURSE_TYPE, DIFFICULT, LANGUAGE, PAGE_LOCATION, PROMOTION_TYPE, SORT_MODE } from "../../../define/define";
import { countCourse, getAllSector, getAllTopic, removeCourse, searchCourseLimit, subscribeCourse } from "../../../service/CourseService";
import { toast } from "react-toastify";

const LIMIT = [5, 10, 20, 50];
const defaultParams = () => ({ sortMode: SORT_MODE.ASC, sortBy: COURSE_SORT_BY.NAME.key, pageSize: 10, pageNumber: 1, keySearch: '' })
const CourseIndex = () => {
    const { handleReset, setTitle, setIsMainFull, openPopupConfirmAlert } = useOutletContext();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [totalRecord, setTotalRecord] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
    const [allSector, setAllSector] = useState([]);
    const [countCourses, setCountCourses] = useState(0);
    const [params, setParams] = useState(defaultParams());
    const [showFilter, setShowFilter] = useState(false)
    useEffect(() => {
        if (isFunction(setTitle)) {
            setTitle("Quản lý khóa học");
        }

        if (isFunction(setIsMainFull)) {
            setIsMainFull(true);
        }

        init();

        getAllSector()
            .then(res => {
                setAllSector(res.data.data);
            }).catch(_ => { })

        return () => {
            handleReset?.();
        };
    }, []);
    useEffect(() => {
        search();
    }, [params]);
    const search = () => {
        searchCourseLimit({ ...params, sectorId: params.sectorSelected?.id, topicId: params.topicSelected?.id, ...(COURSE_PRICE_RANGE[params.priceRange] || {}) }).then(res => {
            const response = res.data.data;
            setCourses(response.list);
            setTotalRecord(response.totalRecord);
            setTotalPage(response.totalPage);
            if (
                response.totalPage > 0 &&
                params.pageNumber > response.totalPage &&
                params.pageNumber !== response.totalPage
            ) {
                setParams(prev => ({ ...prev, pageNumber: response.totalPage }));
            }
        }).catch(_ => { });
    }
    const init = () => {
        countCourse()
            .then(res => {
                setCountCourses(res.data.data);
            }).catch(_ => { })
    }
    const handleItemSelected = (courseId) => {
        if (selectedCourses.includes(courseId)) {
            setSelectedCourses(selectedCourses.filter(id => id !== courseId));
        } else {
            setSelectedCourses([...selectedCourses, courseId]);
        }
    }
    const handleSectorChange = async (e) => {
        const id = e.target.value;
        const sector = allSector.find(s => s.id === e.target.value);
        const prev = { ...params };
        prev.sectorSelected = sector;
        if (hasData(sector)) {
            if (!hasData(sector?.topics)) {
                const response = await getAllTopic(id);
                sector.topics = response.data.data;
            }
            setAllSector(prev => prev.map(s => s.id === sector.id ? sector : s));
            if (hasData(prev.topicSelected) && prev.topicSelected.sectorId !== sector.id)
                prev.topicSelected = undefined;
        }
        setParams(prev)
    }
    const handleTopicChange = (e) => {
        const id = e.target.value;
        const topic = params?.sectorSelected?.topics?.find(t => t.id === id);
        const prev = { ...params, topicSelected: topic };
        setParams(prev);
    }
    const handleRemoveCourse = (ids) => {
        if (!hasData(ids) || !isArray(ids)) return;
        openPopupConfirmAlert({
            type: 'warning',
            title: 'Xác nhận xóa',
            label: 'Bản ghi sẽ bị xóa vĩnh viễn, bạn có chắc muốn xóa?',
            onAccept: () => {
                removeCourse(ids)
                    .then(_ => {
                        init();
                        search();
                        setSelectedCourses([]);
                        toast.success('Xóa thành công!');
                    })
                    .catch(_ => { })
            }
        })
    }
    return (
        <div className="pg bg-white p-4">
            <div id="list-pg">
                <div className="topbar">
                    <div className="topbar-left">
                        <div className="pg-title font-semibold">
                            Quản lý khóa học
                        </div>

                        <div className="pg-sub !text-sm mt-1 mb-2">
                            Tổng quan toàn bộ khóa học
                        </div>
                    </div>
                </div>

                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-label font-semibold">
                            Tổng khóa học
                        </div>

                        <div className="stat-val">
                            {countCourses}
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-label font-semibold">
                            Tổng lượt đăng ký
                        </div>

                        <div className="stat-val">
                            0
                        </div>

                    </div>

                    <div className="stat-card">
                        <div className="stat-label font-semibold">
                            Tổng học viên đăng ký
                        </div>

                        <div className="stat-val">
                            0
                        </div>

                    </div>
                </div>

                <div className="toolbar !items-stretch flex-col !gap-0">
                    <div className="w-full max-w-full flex flex-row flex-nowrap justify-stretch gap-2">
                        <div className="w-full flex-1 @md:max-w-3xl flex flex-row items-center border border-color-secondary rounded-lg px-2 text-sm focus-within:border-color-primary focus-within:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                            <FontAwesomeIcon icon={faSearch} className="" />
                            <input
                                value={params?.keyword || ''}
                                className="w-full border-none focus:ring-0 focus:outline-none ms-2 py-[7px] text-sm"
                                type="text"
                                placeholder="Tìm kiếm khóa học..."
                                onChange={(e) => setParams(prev => ({ ...prev, keyword: e.target.value }))}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setParams(defaultParams())}
                            className=" rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all px-2 disabled:pointer-events-none disabled:opacity-60"
                            title="Xóa bộ lọc"
                            disabled={deepEquals(params, defaultParams())}
                        >
                            <FontAwesomeIcon icon={faBroom} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFilter(prev => !prev)}
                            className=" rounded-lg border border-gray-200 text-blue-600 hover:bg-blue-50 transition-all border-color-secondary px-2"
                            title="Bộ lọc tìm kiếm"
                        >
                            <FontAwesomeIcon icon={faFilter} />
                        </button>
                    </div>

                    {<div className={`flex flex-row flex-wrap gap-2 transition duration-300 ${showFilter ? 'opacity-100 translate-y-0 mt-2' : 'max-h-0 opacity-0 -translate-y-2 overflow-hidden'}`}>
                        <select value={params?.sectorSelected?.id || ''} className="max-w-full w-full @sm:w-auto @sm:max-w-60 filter-select focus:border-color-primary focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]" onChange={handleSectorChange}>
                            <option value="">
                                Lĩnh vực
                            </option>
                            {allSector.map((sector) => (
                                <option key={sector.id} value={sector.id}>
                                    {sector.name}
                                </option>
                            ))}
                        </select>

                        <select value={params?.topicSelected?.id || ''} className="max-w-full w-full @sm:w-auto @sm:max-w-60 filter-select focus:border-color-primary focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]" onChange={handleTopicChange}>
                            <option value="">
                                Chủ đề
                            </option>
                            {[...(params?.sectorSelected?.topics || [])].map((topic) => (
                                <option key={topic.id} value={topic.id}>
                                    {topic.name}
                                </option>
                            ))}
                        </select>

                        <select title="Ngôn ngữ" value={params?.language || ''} className="max-w-full w-full @sm:w-auto @sm:max-w-60 filter-select focus:border-color-primary focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]" onChange={e => setParams(prev => ({ ...prev, language: e.target.value }))}>
                            <option value="">
                                Ngôn ngữ
                            </option>
                            {Object.keys(LANGUAGE).map((key, index) => {
                                return <option key={index} value={key}>
                                    {LANGUAGE[key]}
                                </option>
                            })}

                        </select>

                        <select title="Độ khó" value={params?.difficult || ''} className="max-w-full w-full @sm:w-auto @sm:max-w-60 filter-select focus:border-color-primary focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]" onChange={e => setParams(prev => ({ ...prev, difficult: e.target.value }))}>
                            <option value="">
                                Độ khó
                            </option>
                            {Object.keys(DIFFICULT).map((key, index) => {
                                return <option key={index} value={key}>
                                    {DIFFICULT[key]}
                                </option>
                            })}
                        </select>

                        <select title="Loại khóa học" value={params?.type || ''} className="max-w-full w-full @sm:w-auto @sm:max-w-60 filter-select focus:border-color-primary focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]" onChange={e => setParams(prev => ({ ...prev, type: e.target.value, priceRange: undefined }))}>
                            <option value="">
                                Loại khóa học
                            </option>
                            {Object.keys(COURSE_TYPE).map((key, index) => {
                                return <option key={index} value={key}>
                                    {COURSE_TYPE[key]}
                                </option>
                            })}
                        </select>

                        {params.type === 'PAID' && <select title="Khoảng giá" value={params?.priceRange || ''} className="max-w-full w-full @sm:w-auto @sm:max-w-60 filter-select focus:border-color-primary focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]" onChange={e => setParams(prev => ({ ...prev, priceRange: e.target.value }))}>
                            <option value="">
                                Khoảng giá
                            </option>
                            {COURSE_PRICE_RANGE.map((item, index) => {
                                return <option key={index} value={index}>
                                    {hasData(item.priceFrom) && hasData(item.priceTo) ? `Từ ${formatNumber(item.priceFrom)}đ đến ${formatNumber(item.priceTo)}đ` : (
                                        hasData(item.priceFrom) ? `Trên ${formatNumber(item.priceFrom)}đ` :
                                            hasData(item.priceTo) ? `Dưới ${formatNumber(item.priceTo)}đ` : ''
                                    )}
                                </option>
                            })}
                        </select>}
                    </div>}
                </div>

                <div id="table-container" className="w-full border border-b-0 rounded-t-lg border-color-tertiary">
                    <div className="p-2 flex flex-row flex-wrap gap-2 justify-between items-center">
                        <div className="flex flex-row space-x-2">
                            <button className="btn-new !bg-gray-700" type="button" onClick={() => navigate(PAGE_LOCATION.ADMIN_CREATE_COURSE)}>
                                <FontAwesomeIcon icon={faPlus} />
                                <span>Tạo khóa học</span>
                            </button>
                            <button type="button" disabled={!hasData(selectedCourses)} className="btn-new !bg-red-500 disabled:!opacity-60 disabled:!cursor-default" onClick={() => handleRemoveCourse([...selectedCourses])}>
                                <FontAwesomeIcon icon={faClose} />
                                <span>Xóa</span>
                            </button>
                        </div>
                        <div className="flex flex-row space-x-2 items-center">
                            <label htmlFor="sort-select" className="text-sm">Sắp xếp:</label>
                            <select id="sort-select" className="p-2 select filter-select" value={params?.sortBy} onChange={(e) => setParams(prev => ({ ...prev, sortBy: e.target.value }))}>
                                {Object.values(COURSE_SORT_BY).map(sort => (
                                    <option key={sort.key} value={sort.key}>{sort.label}</option>
                                ))}
                            </select>
                            <div className="view-toggle" >
                                <button
                                    className={`vt-btn ${params?.sortMode === SORT_MODE.ASC ? 'on' : ''} !shadow-none`}
                                    onClick={() => setParams(prev => ({ ...prev, sortMode: SORT_MODE.ASC }))}
                                    title="Tăng dần"
                                >
                                    <FontAwesomeIcon icon={faArrowDownShortWide} />
                                </button>

                                <button
                                    className={`vt-btn ${params?.sortMode === SORT_MODE.DESC ? 'on' : ''} !shadow-none`}
                                    onClick={() => setParams(prev => ({ ...prev, sortMode: SORT_MODE.DESC }))}
                                    title="Giảm dần"
                                >
                                    <FontAwesomeIcon icon={faArrowDownWideShort} />
                                </button>
                            </div>
                            <select id="limit-select" className="p-2 select filter-select" value={params?.pageSize || LIMIT[0]} onChange={(e) => setParams(prev => ({ ...prev, pageSize: Number(e.target.value) }))}>
                                {LIMIT.map(l => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="w-full max-w-full overflow-auto">
                        <table className="course-table !w-auto min-w-full">
                            <thead>
                                <tr>
                                    <th style={{ width: "40px" }}>
                                        <input type="checkbox" className="header-checkbox" checked={selectedCourses.length === courses.length && courses.length > 0} onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedCourses(courses.map(c => c.id));
                                            } else {
                                                setSelectedCourses([]);
                                            }
                                        }} />
                                    </th>
                                    <th >Khóa học</th>
                                    <th className="text-nowrap">Lĩnh vực {'/'} Chủ đề </th>
                                    <th >Độ khó</th>
                                    <th >Ngôn ngữ</th>
                                    <th >Giảng viên</th>
                                    <th >Loại</th>
                                    <th >Giá</th>
                                    <th >Khuyến mãi</th>
                                    <th >Thời gian cập nhật</th>
                                    <th >Học viên</th>
                                    <th >Đánh giá</th>
                                    <th >Hành động</th>
                                </tr>
                            </thead>

                            <tbody>
                                {!hasData(courses) && <tr><td colSpan="10" className="text-center">Không có dữ liệu</td></tr>}
                                {courses?.map((course) => (
                                    <tr key={course.id} className="crow !cursor-default" onClick={_ => handleItemSelected(course.id)}>
                                        <td>
                                            <span>
                                                <input type="checkbox" className="row-checkbox" checked={selectedCourses.includes(course.id)} onChange={_ => handleItemSelected(course.id)} />
                                            </span>
                                        </td>

                                        <td title={course.name + '\n' + course.description} className="overflow-hidden" style={{ maxWidth: '300px' }}>
                                            <div>
                                                <div className="course-name-cell" >
                                                    <div className="thumb-icon-wrap overflow-hidden" >
                                                        <img className="h-auto object-cover rounded" src={course.thumbnail || "/img/course-img-default.jpg"} alt={course.name} />
                                                    </div>

                                                    <div className="course-name-wrap" >
                                                        <div className="cname !text-base">
                                                            {course.name}
                                                        </div>

                                                        <div className="cfield" >
                                                            {course.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td title={course.sector.name + ' / ' + course.topic.name}>
                                            <span>
                                                {course.sector.name} {'/'} {course.topic.name}
                                            </span>
                                        </td>

                                        <td>
                                            <span>
                                                {DIFFICULT[course.difficult]}
                                            </span>
                                        </td>

                                        <td style={{ fontWeight: 500 }}>
                                            <span>
                                                {LANGUAGE[course.language]}
                                            </span>
                                        </td>

                                        <td>
                                            <span>
                                                {course.professorName}
                                            </span>
                                        </td>

                                        <td>
                                            <span>
                                                {COURSE_TYPE[course.type]}
                                            </span>
                                        </td>
                                        <td>
                                            <span>
                                                {course.type === 'FREE' ? '0' : formatNumber(course.price)} VNĐ
                                            </span>
                                        </td>

                                        <td className="">
                                            <span>
                                                {course.type === 'FREE' ? '0' :
                                                    (course.promotionType === PROMOTION_TYPE.MONEY.id ?
                                                        (formatNumber(course?.promotion) + ' ' + PROMOTION_TYPE.MONEY.label) :
                                                        course.promotionType === PROMOTION_TYPE.PERCENT.id ?
                                                            (course.promotion + ' ' + PROMOTION_TYPE.PERCENT.label) :
                                                            '0')}
                                            </span>
                                        </td>

                                        <td>
                                            <span>
                                                {formatDateTime(new Date(course.updatedTime))}
                                            </span>
                                        </td>

                                        <td>
                                            <span>
                                                {course.countSubscribe}
                                            </span>
                                        </td>

                                        <td>
                                            <span>
                                                {course.countEvaluate > 0 ? course.evaluate : 'Chưa có đánh giá'}
                                            </span>
                                        </td>

                                        <td>
                                            <div>
                                                <div className="action-btns" onClick={e => e.stopPropagation()}>
                                                    <button title="Xem chi tiết" onClick={() => navigate(PAGE_LOCATION.ADMIN_DETAIL_COURSE(course.id))} type="button" className="icon-btn info"><FontAwesomeIcon icon={faCircleInfo} /></button>
                                                    <button title="Sửa" onClick={() => navigate(`${PAGE_LOCATION.ADMIN_UPDATE_COURSE}?id=${course.id}`)} type="button" className="icon-btn edit"><FontAwesomeIcon icon={faPenToSquare} /></button>
                                                    <button title="Xóa" onClick={_ => handleRemoveCourse([course.id])} type="button" className="icon-btn danger"><FontAwesomeIcon icon={faTrash} /></button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {hasData(courses) && <div className="pagination !m-0 flex-wrap !p-2 border !border-t-0 rounded-b-lg border-color-tertiary">
                <span className="pag-info">
                    Hiển thị {totalRecord === 0 ? 0 : (params?.pageNumber - 1) * params?.pageSize + 1} – {Math.min(params?.pageNumber * params?.pageSize, totalRecord)} trong {totalRecord} khóa học
                </span>

                <div className="pag-btns">
                    <button className="pag-btn" disabled={params?.pageNumber === 1} onClick={() => setParams(prev => ({ ...prev, pageNumber: 1 }))}>
                        Trang đầu
                    </button>
                    <button className="pag-btn" disabled={params?.pageNumber === 1} onClick={() => setParams(prev => ({ ...prev, pageNumber: params?.pageNumber - 1 }))}>
                        ‹
                    </button>

                    {params?.pageNumber - 1 > 0 && <button className="pag-btn" onClick={() => setParams(prev => ({ ...prev, pageNumber: params?.pageNumber - 1 }))}>
                        {params?.pageNumber - 1}
                    </button>}

                    <button className={`pag-btn active`} onClick={() => setParams(prev => ({ ...prev, pageNumber: params?.pageNumber }))}>
                        {params?.pageNumber}
                    </button>

                    {params?.pageNumber + 1 <= totalPage && <button className="pag-btn" onClick={() => setParams(prev => ({ ...prev, pageNumber: params?.pageNumber + 1 }))}>
                        {params?.pageNumber + 1}
                    </button>}

                    <button className="pag-btn" disabled={params?.pageNumber === totalPage} onClick={() => setParams(prev => ({ ...prev, pageNumber: params?.pageNumber + 1 }))}>
                        ›
                    </button>

                    <button className="pag-btn" disabled={params?.pageNumber === totalPage} onClick={() => setParams(prev => ({ ...prev, pageNumber: totalPage }))}>
                        Trang cuối
                    </button>
                </div>
            </div>}
        </div>
    );
};

export default CourseIndex;