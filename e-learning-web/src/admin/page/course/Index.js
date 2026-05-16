import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowDownShortWide,
    faArrowDownWideShort,
    faCircleInfo,
    faClose,
    faPenToSquare,
    faPlus,
    faSearch,
    faTrash
} from "@fortawesome/free-solid-svg-icons";

import { formatDateTime, formatNumber, hasData, isArray, isFunction } from "../../../helper/utils";
import "./style.css";
import { COURSE_TYPE, DIFFICULT, LANGUAGE, PAGE_LOCATION } from "../../../define/define";
import { countCourse, getAllSector, getAllTopic, removeCourse, searchCourseLimit } from "../../../service/CourseService";
import { toast } from "react-toastify";

const SORT_MODE = Object.freeze({
    ASC: 'ASC',
    DESC: 'DESC'
})
const SORT_BY = Object.freeze({
    NAME: { label: 'Tên khóa học', key: 'NAME' },
    CREATED_TIME: { label: 'Thời gian tạo', key: 'CREATED_TIME' },
    PRICE: { label: 'Giá', key: 'PRICE' }
})
const PRICE_RANGE = Object.freeze([
    { priceTo: 200000 },
    { priceFrom: 200000, priceTo: 500000 },
    { priceFrom: 500000, priceTo: 1000000 },
    { priceFrom: 1000000 }
])
const LIMIT = [5, 10, 20, 50];
const CourseIndex = () => {
    const { handleReset, setTitle, setIsMainFull, openConfirmAlert } = useOutletContext();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [totalRecord, setTotalRecord] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
    const [allSector, setAllSector] = useState([]);
    const [allTopic, setAllTopic] = useState([]);
    const [countCourses, setCountCourses] = useState(0);
    const [params, setParams] = useState({ sortMode: SORT_MODE.ASC, sortBy: SORT_BY.NAME.key, pageSize: 10, pageNumber: 1, keySearch: '' });
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

        getAllTopic()
            .then(res => {
                setAllTopic(res.data.data);
            }).catch(_ => { })

        return () => {
            handleReset?.();
        };
    }, []);
    useEffect(() => {
        search();
    }, [params]);
    const search = () => {
        searchCourseLimit({ ...params, sectorId: params.sectorSelected?.id, topicId: params.topicSelected?.id, ...(PRICE_RANGE[params.priceRange] || {}) }).then(res => {
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
    const handleSectorChange = (e) => {
        const id = e.target.value;
        const sector = allSector.find(s => s.id === e.target.value);
        const prev = { ...params };
        prev.sectorSelected = sector;
        if (hasData(sector)) {
            if (!hasData(sector?.topics)) {
                const topics = allTopic?.filter(t => t.sectorId === id);
                sector.topics = topics;
            }
            setAllSector(prev => prev.map(s => s.id === sector.id ? sector : s));
            if (hasData(prev.topicSelected) && prev.topicSelected.sectorId !== sector.id)
                prev.topicSelected = undefined;
        }
        setParams(prev)
    }
    const handleTopicChange = (e) => {
        const id = e.target.value;
        const topic = allTopic.find(t => t.id === id);
        const prev = { ...params, topicSelected: topic };
        if (hasData(topic)) {
            const sector = allSector.find(s => s.id === topic.sectorId);
            if (hasData(sector) && !hasData(sector?.topics)) {
                const topics = allTopic?.filter(t => t.sectorId === sector.id);
                sector.topics = topics;
                setAllSector(prev => prev.map(s => s.id === sector.id ? sector : s));
            }
            prev.sectorSelected = sector;
        }
        setParams(prev);
    }
    const handleRemoveCourse = (ids) => {
        if (!hasData(ids) || !isArray(ids)) return;
        openConfirmAlert({
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
        <div className="pg bg-white p-4" id="app">
            <div id="list-pg">
                <div className="topbar">
                    <div className="topbar-left">
                        <div className="pg-title font-semibold">
                            Quản lý khóa học
                        </div>

                        <div className="pg-sub">
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
                            Tổng học viên
                        </div>

                        <div className="stat-val">
                            0
                        </div>

                    </div>
                </div>

                <div className="toolbar !items-stretch">
                    <div className="w-full max-w-full md:max-w-md flex flex-row items-center border border-[var(--color-border-secondary)] rounded-lg px-2 py-1 text-sm focus-within:border-[var(--color-border-primary)] focus-within:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
                        <FontAwesomeIcon icon={faSearch} className="" />
                        <input
                            value={params?.keyword || ''}
                            className="w-full border-none focus:ring-0 focus:outline-none ms-2"
                            type="text"
                            placeholder="Tìm kiếm khóa học..."
                            onChange={(e) => setParams(prev => ({ ...prev, keyword: e.target.value }))}
                        />
                    </div>


                    <select value={params?.sectorSelected?.id || ''} className="max-w-full w-full sm:w-auto sm:max-w-60 filter-select focus:border-[var(--color-border-primary)] focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]" onChange={handleSectorChange}>
                        <option value="">
                            Lĩnh vực
                        </option>
                        {allSector.map((sector) => (
                            <option key={sector.id} value={sector.id}>
                                {sector.name}
                            </option>
                        ))}
                    </select>

                    <select value={params?.topicSelected?.id || ''} className="max-w-full w-full sm:w-auto sm:max-w-60 filter-select focus:border-[var(--color-border-primary)] focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]" onChange={handleTopicChange}>
                        <option value="">
                            Chủ đề
                        </option>
                        {[...((hasData(params?.sectorSelected) ? params?.sectorSelected?.topics : allTopic) || [])].map((topic) => (
                            <option key={topic.id} value={topic.id}>
                                {topic.name}
                            </option>
                        ))}
                    </select>

                    <select title="Ngôn ngữ" value={params?.language || ''} className="max-w-full w-full sm:w-auto sm:max-w-60 filter-select focus:border-[var(--color-border-primary)] focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]" onChange={e => setParams(prev => ({ ...prev, language: e.target.value }))}>
                        <option value="">
                            Ngôn ngữ
                        </option>
                        {Object.keys(LANGUAGE).map((key, index) => {
                            return <option key={index} value={key}>
                                {LANGUAGE[key]}
                            </option>
                        })}

                    </select>

                    <select title="Độ khó" value={params?.difficult || ''} className="max-w-full w-full sm:w-auto sm:max-w-60 filter-select focus:border-[var(--color-border-primary)] focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]" onChange={e => setParams(prev => ({ ...prev, difficult: e.target.value }))}>
                        <option value="">
                            Độ khó
                        </option>
                        {Object.keys(DIFFICULT).map((key, index) => {
                            return <option key={index} value={key}>
                                {DIFFICULT[key]}
                            </option>
                        })}
                    </select>

                    <select title="Loại khóa học" value={params?.type || ''} className="max-w-full w-full sm:w-auto sm:max-w-60 filter-select focus:border-[var(--color-border-primary)] focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]" onChange={e => setParams(prev => ({ ...prev, type: e.target.value, priceRange: undefined }))}>
                        <option value="">
                            Loại khóa học
                        </option>
                        {Object.keys(COURSE_TYPE).map((key, index) => {
                            return <option key={index} value={key}>
                                {COURSE_TYPE[key]}
                            </option>
                        })}
                    </select>

                    {params.type === 'PAID' && <select title="Khoảng giá" value={params?.priceRange || ''} className="max-w-full w-full sm:w-auto sm:max-w-60 filter-select focus:border-[var(--color-border-primary)] focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]" onChange={e => setParams(prev => ({ ...prev, priceRange: e.target.value }))}>
                        <option value="">
                            Khoảng giá
                        </option>
                        {PRICE_RANGE.map((item, index) => {
                            return <option key={index} value={index}>
                                {hasData(item.priceFrom) && hasData(item.priceTo) ? `Từ ${formatNumber(item.priceFrom)}đ đến ${formatNumber(item.priceTo)}đ` : (
                                    hasData(item.priceFrom) ? `Trên ${formatNumber(item.priceFrom)}đ` :
                                        hasData(item.priceTo) ? `Dưới ${formatNumber(item.priceTo)}đ` : ''
                                )}
                            </option>
                        })}
                    </select>}
                </div>

                <div id="table-container" className="w-full border border-b-0 rounded-t">
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
                                {Object.values(SORT_BY).map(sort => (
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
                                    <th style={{ width: "30%" }}>Khóa học</th>
                                    <th >Độ khó</th>
                                    <th >Ngôn ngữ</th>
                                    <th >Loại</th>
                                    <th >Giá</th>
                                    <th>Thời gian tạo</th>
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
                                            <input type="checkbox" className="row-checkbox" checked={selectedCourses.includes(course.id)} onChange={_ => handleItemSelected(course.id)} />
                                        </td>
                                        <td className="overflow-hidden">
                                            <div className="course-name-cell" >
                                                <div className="thumb-icon-wrap !h-auto" >
                                                    <img className="h-auto aspect-square object-cover rounded" src={course.thumbnail || "/img/course-img-default.jpg"} alt={course.name} />
                                                </div>

                                                <div className="course-name-wrap" >
                                                    <div className="cname">
                                                        {course.name}
                                                    </div>

                                                    <div className="cfield" >
                                                        {course.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            {DIFFICULT[course.difficult]}
                                        </td>

                                        <td style={{ fontWeight: 500 }}>
                                            {LANGUAGE[course.language]}
                                        </td>

                                        <td>
                                            {COURSE_TYPE[course.type]}
                                        </td>
                                        <td>
                                            {course.type === 'FREE' ? '0' : formatNumber(course.price)}đ
                                        </td>

                                        <td>{formatDateTime(new Date(course.createdTime))}</td>

                                        <td></td>

                                        <td></td>

                                        <td>
                                            <div className="action-btns" onClick={e => e.stopPropagation()}>
                                                <button title="Xem chi tiết" onClick={() => navigate(PAGE_LOCATION.ADMIN_DETAIL_COURSE(course.id))} type="button" className="icon-btn"><FontAwesomeIcon icon={faCircleInfo} /></button>
                                                <button title="Sửa" onClick={() => navigate(`${PAGE_LOCATION.ADMIN_UPDATE_COURSE}?id=${course.id}`)} type="button" className="icon-btn"><FontAwesomeIcon icon={faPenToSquare} /></button>
                                                <button title="Xóa" onClick={_ => handleRemoveCourse([course.id])} type="button" className="icon-btn danger"><FontAwesomeIcon icon={faTrash} /></button>
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
            {hasData(courses) && <div className="pagination !m-0 flex-wrap !p-2 border !border-t-0 rounded-b">
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