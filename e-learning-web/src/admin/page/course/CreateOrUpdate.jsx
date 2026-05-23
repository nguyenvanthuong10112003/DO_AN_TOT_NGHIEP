import { toast } from "react-toastify";
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import './style.css';
import { use, useEffect, useState } from 'react';
import { deepEquals, formatDate, formatDateTime, formatNumber, hasData, isAllNumberOrLatin, isArray, isFunction, isObject, isString, trimAll, validatePhoto } from '../../../helper/utils';
import { ACTION, DIFFICULT, LANGUAGE, PAGE_LOCATION, LOCAL_STORAGE_KEY, COURSE_TYPE, PHOTO_ALLOWED_TYPE, PHOTO_MAXIMUM_SIZE_MB, RATIOS } from '../../../define/define';
import { createOrUpdateCourse, getAllSector, getAllTopic, getCourseById, searchCourse, searchTag } from '../../../service/CourseService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faClock, faClose } from '@fortawesome/free-solid-svg-icons';
import Template1 from '../../../comp/CertificateTemplate/Template1';
import Template2 from '../../../comp/CertificateTemplate/Template2';
import Template3 from '../../../comp/CertificateTemplate/Template3';
import Template4 from '../../../comp/CertificateTemplate/Template4';
import React from "react";
import { removePhoto, uploadTempPhoto } from "../../../service/PhotoService";
import { hasUnsavedChangesStore } from "../../../store/HasUnsavedChangesStore";
import AutocompleteInput from "../../../comp/AutocompleteInput";

const certificateTemplates = [
    { template: Template1, name: 'Mẫu 1', code: 'Template1' },
    { template: Template2, name: 'Mẫu 2', code: 'Template2' },
    { template: Template3, name: 'Mẫu 3', code: 'Template3' },
    { template: Template4, name: 'Mẫu 4', code: 'Template4' }
];

const courseConstruct = () => ({
    difficult: 'BASIC',
    type: 'FREE',
    language: 'VI'
});

const CreateOrUpdate = ({ action }) => {
    const { setControllers, setTitle, handleReset, openPopupConfirmAlert, openPopupResizeImage } = useOutletContext();
    const [sectors, setSectors] = useState([]);
    const [topics, setTopics] = useState([]);
    const [isAddNewTopic, setIsAddNewTopic] = useState(false);
    const [isAddNewSector, setIsAddNewSector] = useState(false);
    const [isPreViewTemplateCer, setIsPreViewTemplateCer] = useState(false);
    const [inputTag, setInputTag] = useState('');
    const [inputKeyWord, setInputKeyWord] = useState('');
    const [keyTemp, setKeyTemp] = useState('');
    const [currentKeyTemp, setCurrentKeyTemp] = useState('');
    const [inputSuggestCourse, setInputSuggestCourse] = useState('')
    const [course, setCourse] = useState(courseConstruct());
    const [lstTemp, setLstTemp] = useState({});
    const [errors, setErrors] = useState({})
    const [searchSuggestCourse, setSearchSuggestCourse] = useState([]);
    const [searchTagRs, setSearchTagRs] = useState([]);
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [dragging, setDragging] = useState(false)

    useEffect(() => {
        const title = action === ACTION.CREATE ? 'Tạo khóa học' : (action === ACTION.UPDATE && 'Cập nhật khóa học');
        if (isFunction(setTitle)) setTitle(title);
        if (isFunction(setControllers)) setControllers([{ name: 'Quản lý khóa học', url: PAGE_LOCATION.ADMIN_MANAGEMENT_COURSE }, { name: title }]);
        if (action === ACTION.CREATE) {
            const newKey = Date.now().toString();
            setCurrentKeyTemp(newKey)
            setKeyTemp(newKey)
            let lstTempLocal = {};
            try {
                lstTempLocal = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY.COURSE_DATA_TEMP)) || {}
            } catch { }
            if (hasData(lstTempLocal))
                lstTempLocal[newKey] = { ...course };
            setLstTemp(lstTempLocal);
        }
        const init = async () => {
            if (action === ACTION.UPDATE) {
                const courseId = params.get('id');
                if (!hasData(courseId)) {
                    toast.error('Không tìm thấy khóa học cần cập nhật!');
                    return;
                }
                try {
                    const response = await getCourseById(courseId);
                    const c = response?.data?.data;
                    if (!hasData(c) || !hasData(c?.id)) {
                        toast.error('Không tìm thấy khóa học cần cập nhật!');
                        return;
                    }
                    c.price = formatNumber(c.price);
                    setLstTemp({ [c.id]: c });
                    setKeyTemp(c.id);
                    setCourse(c);
                    getAllTopic(response?.data?.data?.sector?.id)
                        .then(response => {
                            setTopics(response?.data?.data);
                        })
                        .catch(_ => { })
                } catch {
                    return;
                }
            }
            getAllSector()
                .then(response => {
                    setSectors(response?.data?.data)
                })
                .catch(_ => { })
        }
        init();
        return () => {
            handleReset?.();
        };
    }, [action]);

    useEffect(() => {
        if (isAddNewSector === true)
            setIsAddNewTopic(true);
        setCourse(prev => {
            const { newSectorName, sectorId, ...newObj } = { ...prev };
            if (isAddNewSector === true) {
                newObj.newSectorName = '';
            }
            return newObj;
        })
    }, [isAddNewSector])

    useEffect(() => {
        setCourse(prev => {
            const { newTopicName, topicId, ...newObj } = { ...prev };
            if (isAddNewTopic === true) {
                newObj.newTopicName = '';
            }
            return newObj;
        })
    }, [isAddNewTopic])

    useEffect(() => {
        const initialData = lstTemp[keyTemp] || {};
        const isDirty = !deepEquals(course, initialData);
        hasUnsavedChangesStore.set(isDirty);
    }, [course, lstTemp, keyTemp]);

    const handleSectorSelected = (e) => {
        const sector = sectors.find(s => s.id === e.target.value);
        if (!hasData(sector)) {
            setCourse(prev => {
                const { sectorId, ...others } = { ...prev };
                return others;
            })
            setTopics([])
            return;
        }
        setCourse(prev => ({ ...prev, sectorId: sector.id }))
        if (hasData(sector.topics)) {
            setTopics(sector.topics)
            return;
        }
        getAllTopic(sector.id)
            .then(response => {
                setTopics(response?.data?.data);
                setSectors(prev => {
                    return prev.map(s => {
                        if (s.id === sector.id)
                            s.topics = response?.data?.data;
                        return s;
                    })
                })
            })
            .catch(_ => { })
    }

    const handleTopicSelected = (e) => {
        const topic = topics.find(t => t.id === e.target.value);
        if (!hasData(topic)) {
            setCourse(prev => {
                const { topicId, ...others } = { ...prev };
                return others;
            })
            return;
        }
        setCourse(prev => ({ ...prev, topicId: topic.id }))
    }

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleThumbnailChange(e.dataTransfer.files);
    };

    const handleThumbnailChange = async (selectedFiles) => {
        if (selectedFiles.length === 0) return;

        if (selectedFiles.length > 1) {
            toast.error(`Tải lên tối đa 1 file!`);
            return;
        }

        let file = selectedFiles[0];
        const message = validatePhoto(file);
        if (isString(message)) {
            toast.error(message)
            return;
        }

        openPopupResizeImage([RATIOS.LANDSCAPE_3_2] ,file, (newFile) => {
            file = newFile;
            uploadTempPhoto([file])
                .then(response => {
                    const photoResponse = response?.data?.data?.[0];
                    setCourse(prev => ({ ...prev, thumbnail: photoResponse.url, thumbnailId: photoResponse.id }));
                }).catch(_ => {})
        })
    };

    const handleRemoveThumbnail = async () => {
        const oldThumbnailId = course.thumbnailId;
        if (!hasData(oldThumbnailId)) return;
        setCourse(prev => { const { thumbnail, thumbnailId, ...newObj } = { ...prev }; return newObj; })
    }

    const handleAddTag = () => {
        const newTag = inputTag?.trim() || '';
        if (!hasData(newTag)) return;
        if (course?.tags?.find(tagName => tagName === newTag) !== undefined) {
            toast.error('Tag đã được thêm trước đó');
            return;
        }
        setCourse(prev => ({ ...prev, tags: [...(prev.tags || []), newTag] }))
        setInputTag('')
    }

    const handleAddKeyWord = () => {
        const newKeyWord = inputKeyWord?.trim() || '';
        if (!hasData(newKeyWord)) return;
        if (course?.lstRequiredKnowledge?.find(kw => kw === newKeyWord) !== undefined) {
            toast.error('Từ khóa đã được thêm trước đó');
            return;
        }
        setCourse(prev => ({ ...prev, lstRequiredKnowledge: [...(prev.lstRequiredKnowledge || []), newKeyWord] }))
        setInputKeyWord('')
    }

    const handleSaveTemp = () => {
        if (ACTION.CREATE === action) {
            const others = {}
            Object.keys(lstTemp).forEach(key => {
                if (key === currentKeyTemp) return;
                others[key] = lstTemp[key];
            })
            others[keyTemp] = course;
            setLstTemp(others)
            localStorage.setItem(LOCAL_STORAGE_KEY.COURSE_DATA_TEMP, JSON.stringify(others))
            toast.success('Lưu thành công!');
            if (keyTemp === currentKeyTemp) {
                const newKey = Date.now().toString();
                setCurrentKeyTemp(newKey);
                others[newKey] = courseConstruct()
            } else
                others[currentKeyTemp] = lstTemp[currentKeyTemp];
            setLstTemp(others)
        }
    }

    const handleRemoveTemp = (keyRemove, actionCreateTemp) => {
        if (ACTION.CREATE === action && keyRemove !== currentKeyTemp) {
            let index = -1;
            const others = {}
            const keys = Object.keys(lstTemp).sort((a, b) => Number(b) - Number(a));
            keys.filter((keyItem, i) => {
                if (String(keyItem) === String(keyRemove)) index = i; return String(keyItem) !== String(keyRemove) && String(keyItem) !== String(currentKeyTemp);
            })
                .forEach(key => {
                    others[key] = lstTemp[key];
                })
            localStorage.setItem(LOCAL_STORAGE_KEY.COURSE_DATA_TEMP, JSON.stringify(others))
            if (actionCreateTemp !== true)
                toast.success('Xóa thành công!');
            others[currentKeyTemp] = lstTemp[currentKeyTemp];
            if (String(keyRemove) === String(keyTemp)) {
                const newKeyTemp = (keys[index + 1] || keys[index - 1] || keys[0]);
                setKeyTemp(newKeyTemp)
                setCourse(others[newKeyTemp])
            }
            setLstTemp(others)
        }
    }

    const handleChangeTemp = (temp) => {
        const excute = () => {
            if (temp === keyTemp)
                return;
            setKeyTemp(temp);
            setCourse({ ...lstTemp[temp] })
            setErrors({});
        }
        if (hasUnsavedChangesStore.get() !== true || window.confirm('Bạn có thay đổi chưa lưu. Tiếp tục?'))
            excute();
    }

    const isAddTagDisabled = () => {
        const newTag = inputTag?.trim() || '';
        return !(hasData(newTag) && (course?.tags || []).length <= 10 && course?.tags?.find(tagItem => tagItem === newTag) === undefined)
    }

    const isAddKeyWordDisabled = () => {
        const newKeyWord = inputKeyWord?.trim() || '';
        return !(hasData(newKeyWord) && (course?.lstRequiredKnowledge || []).length <= 10 && course?.lstRequiredKnowledge?.find(kw => kw === newKeyWord) === undefined);
    }

    const handlerSave = () => {
        const params = trimAll({ ...course });
        const errors = validateSave(params);
        setErrors(errors)
        if (Object.values(errors)?.length > 0) {
            toast.error(
                <div>
                    {Object.values(errors).map((e, i) => (
                        <div key={i}>{e}</div>
                    ))}
                </div>
            );
            return
        }
        if (hasData(params.price))
            params.price = Array.from(params.price?.split(''))?.filter(item => item >= '0' && item <= '9')?.join('')
        if (hasData(params.suggestCourses))
            params.suggestCourses = params.suggestCourses.map(c => c.id);
        openPopupConfirmAlert({
            type: 'warning',
            title: 'Xác nhận cập nhật',
            label: 'Bạn có chắc muốn lưu thay đổi?',
            onAccept: () => {
                createOrUpdateCourse(params)
                    .then(_ => {
                        toast.success(action === ACTION.CREATE ? 'Thêm thành công' : 'Cập nhật thành công')
                        if (ACTION.UPDATE === action) {
                            setLstTemp(prev => ({ ...prev, [keyTemp]: course }))
                        } else {
                            const newCourse = courseConstruct();
                            if (keyTemp === currentKeyTemp) {
                                const newKey = Date.now().toString();
                                const { [keyTemp]: _, ...others } = { ...(lstTemp || {}) };
                                setCurrentKeyTemp(newKey)
                                setKeyTemp(newKey)
                                setCourse(newCourse);
                                others[newKey] = newCourse;
                                setLstTemp(others);
                            } else
                                handleRemoveTemp(keyTemp, true)
                        }
                    })
                    .catch(_ => { })
            }
        })
    }

    const validateSave = (course) => {
        const errors = {};

        if (!hasData(course?.code))
            errors.code = 'Mã khóa học không được để trống!';
        else if (course?.code.length > 30)
            errors.code = 'Mã khóa học không quá 30 ký tự!';
        else if (isAllNumberOrLatin(course.code) === false)
            errors.code = 'Mã khóa học chỉ được chứa ký tự Latin và số!';

        if (!hasData(course?.name))
            errors.name = 'Tên khóa học không được để trống!';
        else if (course?.name.length > 100)
            errors.name = 'Tên khóa học không quá 100 ký tự!';

        if (!hasData(course?.sectorId) && isAddNewSector !== true)
            errors.sector = 'Lĩnh vực không được để trống!';
        else if (isAddNewSector === true) {
            if (!hasData(course?.newSectorName))
                errors.newSectorName = 'Tên lĩnh vực không được để trống!';
            else if (course?.newSectorName.length > 100)
                errors.newSectorName = 'Tên lĩnh vực không được quá 100 ký tự!';
        }

        if (!hasData(course?.topicId) && isAddNewTopic !== true)
            errors.topic = 'Chủ đề/ danh mục không được để trống!';
        else if (isAddNewTopic === true) {
            if (!hasData(course?.newTopicName))
                errors.newTopicName = 'Tên chủ đề/ danh mục không được để trống!';
            else if (course?.newTopicName.length > 100)
                errors.newTopicName = 'Tên Chủ đề/ danh mục không được quá 100 ký tự!';
        }

        if (!hasData(course?.description))
            errors.description = 'Mô tả ngắn không được để trống!';
        else if (course?.description.length > 300)
            errors.description = 'Mô tả ngắn không được quá 300 ký tự!';

        if (!hasData(course?.difficult))
            errors.difficult = 'Độ khó không được để trống!';

        if (!hasData(course?.language))
            errors.language = 'Ngôn ngữ giảng dạy không được để trống!'

        if (!hasData(course?.type))
            errors.type = 'Loại khóa học không được để trống!'
        else if (course.type === 'PAID' && !hasData(course?.price))
            errors.price = 'Giá khóa học không được để trống!'

        if (course?.issuingCertificate === true) {
            if (!hasData(course?.certificate?.template))
                errors.certificateTemplate = 'Mẫu chứng chỉ không được để trống!'
            if (!hasData(course?.certificate?.professorName))
                errors.certificateProfessorName = 'Tên giám đốc đào tạo không được để trống!'
            else if (course.certificate.professorName.length > 100)
                errors.certificateProfessorName = 'Tên giám đốc đào tạo không được quá 100 ký tự!';
        }

        return errors;
    }

    const handleSearchSuggestCourse = (keyword) => {
        searchCourse(keyword)
            .then(response => {
                let lst = response?.data?.data || [];
                lst = lst.filter(c => c.id !== course?.id && c?.suggestCourses?.find(suggest => suggest.id === course.id) === undefined && course?.suggestCourses?.find(suggest => suggest.id === c.id) === undefined);
                setSearchSuggestCourse(lst);
            })
            .catch(_ => { })
    }

    const handleAddSuggestCourse = () => {
        if (isObject(inputSuggestCourse)) {
            setCourse(prev => ({ ...prev, suggestCourses: [...(prev.suggestCourses || []), inputSuggestCourse] }))
            setInputSuggestCourse('');
        }
    }

    const handleSearchTag = (keyword) => {
        searchTag(keyword)
            .then(response => {
                let lst = response?.data?.data || [];
                lst = lst.filter(tag => course?.tags?.find(tagName => tagName === tag) === undefined);
                setSearchTagRs(lst);
            })
            .catch(_ => { })
    }

    const handleSearchRequiredKnowledge = (keyword) => {
        searchTag(keyword)
            .then(response => {
                let lst = response?.data?.data || [];
                lst = lst.filter(tag => course?.lstRequiredKnowledge?.find(tagName => tagName === tag) === undefined);
                setSearchTagRs(lst);
            })
            .catch(_ => { })
    }

    return <div className="max-w-3xl w-full mx-auto py-6 space-y-4">
        <div className="p-4 bg-white rounded-xl border">
            <button type="button" className="space-x-2 hover:text-blue-500" onClick={() => navigate(PAGE_LOCATION.ADMIN_MANAGEMENT_COURSE)}>
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>Danh sách</span>
            </button>

            {ACTION.CREATE === action && hasData(lstTemp) && <>
                <hr className="my-4"></hr>
                <div className="p-4 bg-white border rounded-xl h-auto max-w-3xl w-full">
                    <h3 className="font-semibold uppercase section-title">Các bản nháp trước đó</h3>
                    <div className="flex flex-col mt-2 gap-1">
                        {Object.keys(lstTemp).sort((a, b) => Number(b) - Number(a)).map((temp, index) => {
                            const courseTemp = lstTemp[temp];
                            return <React.Fragment key={index}>
                                {index > 0 && <hr />}
                                <button onClick={() => handleChangeTemp(temp)} type="button" className={`py-2 px-4 text-start hover:bg-gray-100 flex flex-row items-center justify-between rounded-lg ${keyTemp === temp && '!bg-[var(--color-background-secondary)]'}`}>
                                    <span className="max-w-full overflow-hidden text-ellipsis text-nowrap">
                                        <FontAwesomeIcon icon={faClock} className="me-2" />
                                        <span>{formatDateTime(new Date(Number(temp)))} {courseTemp?.name && '-'} {courseTemp?.name || ''}</span>
                                    </span>
                                    {currentKeyTemp !== temp && <FontAwesomeIcon onClick={(e) => { e.stopPropagation(); handleRemoveTemp(temp) }} icon={faClose} className="ms-2 hover:text-red-600 float-end" />}
                                </button>
                            </React.Fragment>
                        })}
                    </div>
                </div>
            </>}
        </div>
        {(action === ACTION.CREATE || (action === ACTION.UPDATE && hasData(course?.id))) && <div className="p-4 bg-white rounded-xl border">
            <div className="page-header pb-4 mb-4">
                <div>
                    <div className="page-title text-base uppercase">{ACTION.CREATE === action ? 'Tạo khóa học mới' : 'Cập nhật khóa học'}</div>
                    <div className="page-sub text-md">Điền đầy đủ thông tin {ACTION.CREATE === action ? 'để tạo khóa học mới' : 'để cập nhật khóa học'}</div>
                </div>
            </div>

            <div className="section-card mb-4 p-4">
                <div className="section-title section-color-1">Thông tin cơ bản</div>
                <div className="form-grid gap-4">
                    <div className="field form-full">
                        <span className='flex flex-row'>
                            <label>Mã khóa học <span style={{ color: "var(--color-text-danger,#E24B4A)" }}>*</span></label>
                        </span>
                        <input className={`${errors?.code && '!border-red-600'}`} max={100} type="text" id="f-code" placeholder="Ví dụ: KH01"
                            value={course?.code || ''} onChange={(e) => setCourse(prev => ({ ...prev, code: e.target.value }))} />
                    </div>
                    <div className="field form-full">
                        <span className='flex flex-row'>
                            <label>Tên khóa học <span style={{ color: "var(--color-text-danger,#E24B4A)" }}>*</span></label>
                        </span>
                        <input className={`${errors?.name && '!border-red-600'}`} max={100} type="text" id="f-name" placeholder="Ví dụ: Lập trình Python từ cơ bản đến nâng cao"
                            value={course?.name || ''} onChange={(e) => setCourse(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <div className="field">
                        <label>
                            Lĩnh vực <span style={{ color: "var(--color-text-danger,#E24B4A)" }}>*</span>
                            <span className='ms-2 space-x-1'>
                                <input id='check-add-new-sector' className='!w-3 !h-3 !outline-none' type='checkbox' checked={isAddNewSector === true} value={isAddNewSector || ''} onChange={(e) => setIsAddNewSector(prev => !prev)} />
                                <label htmlFor='check-add-new-sector' className='text-sm'>Thêm mới</label>
                            </span>
                        </label>
                        {isAddNewSector === false && <select id="f-field" className={errors?.sector && '!border-red-600'} onChange={handleSectorSelected} value={course?.sectorId || ''}>
                            <option value="">-- Chọn lĩnh vực --</option>
                            {sectors?.map((sector, index) => <option key={index} value={sector.id || ''}>{sector.name}</option>)}
                        </select>}
                        {isAddNewSector === true && <input className={errors?.newSectorName && '!border-red-600'} placeholder='Nhập tên lĩnh vực mới' value={course?.newSectorName || ''} onChange={(e) => setCourse(prev => ({ ...prev, newSectorName: e.target.value }))} />}
                    </div>
                    <div className="field">
                        <label>
                            Chủ đề / Danh mục <span style={{ color: "var(--color-text-danger,#E24B4A)" }}>*</span>
                            <span className='ms-2 space-x-1'>
                                <input id='check-add-new-topic' className='!w-3 !h-3 !outline-none' type='checkbox' disabled={isAddNewSector === true} checked={isAddNewTopic === true} value={isAddNewTopic || ''} onChange={(e) => setIsAddNewTopic(prev => !prev)} />
                                <label htmlFor='check-add-new-topic' className='text-sm'>Thêm mới</label>
                            </span>
                        </label>
                        {isAddNewTopic === false && <select id="f-topic" onChange={handleTopicSelected} value={course?.topicId || ''}>
                            <option value="">-- Chọn chủ đề --</option>
                            {topics?.map((topic, index) => <option key={index} value={topic.id || ''}>{topic.name}</option>)}
                        </select>}
                        {isAddNewTopic === true && <input className={errors?.newTopicName && '!border-red-600'} placeholder='Nhập tên chủ đề/danh mục mới' value={course?.newTopicName || ''} onChange={(e) => setCourse(prev => ({ ...prev, newTopicName: e.target.value }))} />}
                    </div>
                    <div className="field form-full">
                        <label>Mô tả ngắn <span style={{ color: "var(--color-text-danger,#E24B4A)" }}>*</span></label>
                        <textarea className={errors?.description && '!border-red-600'} id="f-desc" maxLength={300} value={course?.description || ''} placeholder="Mô tả tổng quan về khóa học, nội dung học viên sẽ được học..."
                            onChange={(e) => setCourse(prev => ({ ...prev, description: e.target.value }))}></textarea>
                        <span className="hint">Tối đa 300 ký tự. Hiển thị trên trang danh sách khóa học.</span>
                    </div>
                    <div className="field form-full">
                        <label>Ảnh thumbnail khóa học</label>
                        {!hasData(course?.thumbnail) && <div className={`thumb-upload ${dragging && '!border-gray-700'}`}
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            id="thumb-zone" onClick={() => document.getElementById('thumb-inp').click()}>
                            <div className="thumb-icon">↑</div>
                            <div className="thumb-label">Kéo thả hoặc chọn ảnh</div>
                            <div className="thumb-hint">{PHOTO_ALLOWED_TYPE.join(', ').toUpperCase()} · Tối đa {PHOTO_MAXIMUM_SIZE_MB}MB</div>
                        </div>}
                        {hasData(course?.thumbnail) && <div className="thumb-preview border relative !block overflow-hidden !h-80" id="thumb-prev">
                            <button onClick={handleRemoveThumbnail} type='button' className='absolute top-1 left-1 bg-white border border-t-0 border-l-0 p-1 hover:bg-gray-100 rounded-md'><FontAwesomeIcon icon={faClose} />Hủy </button>
                            <img src={course?.thumbnail} alt='thumbnail' className='w-full h-full aspect-square object-cover' />
                        </div>}
                        <input type="file" id="thumb-inp" accept="image/*" onChange={e => handleThumbnailChange(Array.from(e.target.files))} className="hidden" />
                    </div>

                    <div className="field form-full">
                        <label>Độ khó <span style={{ color: "var(--color-text-danger,#E24B4A)" }}>*</span></label>
                        <div className="difficulty-group grid grid-cols-4">
                            {Object.keys(DIFFICULT).map((diffKey, index) => <button type="button" key={index} className={`diff-btn btn-secondary w-full ${diffKey === course?.difficult ? 'active' : ''}`} onClick={() => setCourse(prev => ({ ...prev, difficult: diffKey }))}>{DIFFICULT[diffKey]}</button>)}
                        </div>
                    </div>
                    <div className="field form-full">
                        <label>Ngôn ngữ giảng dạy <span style={{ color: "var(--color-text-danger,#E24B4A)" }}>*</span></label>
                        <div className="lang-badges">
                            {Object.keys(LANGUAGE).map((lanKey, index) => <button type="button" key={index} className={`btn-secondary lang-badge ${course?.language === lanKey && 'selected'}`} onClick={() => setCourse(prev => ({ ...prev, language: lanKey }))}>{LANGUAGE[lanKey]}</button>)}
                        </div>
                    </div>
                    <div className="field">
                        <label>Loại khóa học <span style={{ color: "var(--color-text-danger,#E24B4A)" }}>*</span></label>
                        <div className="price-toggle">
                            <button type="button" className={`pt-btn ${course?.type === 'FREE' && 'active'} hover:bg-white`} id="pt-free" onClick={() => setCourse(prev => ({ ...prev, type: 'FREE', price: undefined }))}>Miễn phí</button>
                            <button type="button" className={`pt-btn ${course?.type === 'PAID' && 'active'} hover:bg-white`} id="pt-paid" onClick={() => setCourse(prev => ({ ...prev, type: 'PAID' }))}>Có phí</button>
                        </div>
                    </div>
                    <div className="field" id="price-field" disabled>
                        <label>Giá (VNĐ) {course?.type === 'PAID' && <span style={{ color: "var(--color-text-danger,#E24B4A)" }}>*</span>}</label>
                        <input value={course?.price || ''} maxLength={18} onChange={(e) => {
                            setCourse(prev => ({ ...prev, price: formatNumber(e.target.value.replace(/[^0-9]/g, '')) }));
                        }} inputMode="numeric" pattern="[0-9]*" type="text" id="f-price" className={`disabled:opacity-60 transition-all ${errors?.price && '!border-red-600'}`} placeholder="Ví dụ: 500,000" min="0" disabled={course?.type === 'FREE'} />
                    </div>
                    <div className="field form-full">
                        <div className="cert-toggle">
                            <button type="button" className={`toggle-sw ${course?.issuingCertificate === true && 'on'}`} id="cert-sw" onClick={() => { setCourse(prev => ({ ...prev, issuingCertificate: !prev.issuingCertificate, certificate: { id: prev.certificate?.id, template: certificateTemplates[0].code } })); setIsPreViewTemplateCer(false) }}></button>
                            <div>
                                <div className="toggle-label">Cấp chứng chỉ hoàn thành</div>
                                <div className="toggle-sub">Học viên nhận chứng chỉ sau khi hoàn tất khóa học</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {course?.issuingCertificate === true && <div className="section-card mb-4 p-4">
                <div className="section-title section-color-4 ">Chứng chỉ khóa học {course?.certificate?.template && <button type='button' className='text-sm font-medium text-blue-500 hover:text-blue-600 hover:underline' onClick={() => setIsPreViewTemplateCer(prev => !prev)}>Xem trước</button>}</div>
                <div className="form-grid gap-4">
                    {isPreViewTemplateCer && course?.certificate?.template && <div className='form-full'>
                        {certificateTemplates.filter((template) => template.code === course?.certificate?.template).map((template, index) => {
                            return <div key={index}>{<template.template professorFullName={course?.certificate?.professorName} courseName={course?.name} issueDate={formatDate(new Date())} />}</div>
                        })}
                    </div>}
                    <div className="field form-full">
                        <label>Chọn mẫu chứng chỉ <span style={{ color: "var(--color-text-danger,#E24B4A)" }}>*</span></label>
                        <div className="flex w-full flex-wrap space-x-2">
                            {certificateTemplates.map((template, index) => {
                                return <button type='button' htmlFor={`certificateTemplate-${index}`} key={index} className={`diff-btn space-x-2 text-center p-2 w-1/4 ${course?.certificate?.template === template.code && 'active'}`} onClick={() => setCourse(prev => ({ ...prev, certificate: { ...prev.certificate, template: template.code } }))}>
                                    <span>{template.name}</span>
                                    <span onClick={() => setIsPreViewTemplateCer(true)} type='button' className='text-blue-500 hover:underline hover:text-blue-600'>Xem</span>
                                </button>
                            })}
                        </div>
                    </div>
                    <div className="field form-full">
                        <span className='flex flex-row'>
                            <label>Giám đốc đào tạo <span style={{ color: "var(--color-text-danger,#E24B4A)" }}>*</span></label>
                        </span>
                        <input type="text" placeholder="Nhập tên giám đốc đào tạo" className={errors?.certificateProfessorName && '!border-red-600'}
                            value={course?.certificate?.professorName || ''} onChange={(e) => setCourse(prev => ({ ...prev, certificate: { ...prev.certificate, professorName: e.target.value } }))} />
                    </div>
                </div>
            </div>}

            <div className="section-card mb-4 p-4">
                <div className="section-title section-color-4 ">Kiến thức cần có</div>
                <div className="form-grid gap-4">
                    <div className="field form-full">
                        <label>Từ khóa</label>
                        <div className="tag-input-row">
                            <div className='gap-1 p-1 border border-[var(--color-border-secondary)] flex flex-row items-center flex-wrap rounded-lg w-full focus-within:border-[var(--color-border-primary)] focus-within:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]'>
                                {course?.lstRequiredKnowledge?.map((inputKeyWord, index) => {
                                    return <div key={index} className={`p-1 border border-[var(--color-border-secondary)] rounded-md space-x-1 ms-1 flex flex-row flex-nowrap items-center`}>
                                        <div className='text-ellipsis overflow-hidden max-w-20' title={inputKeyWord}>
                                            <span className='text-nowrap'>{inputKeyWord}</span>
                                        </div>

                                        <FontAwesomeIcon icon={faClose} onClick={() => setCourse(prev => ({ ...prev, lstRequiredKnowledge: (prev.lstRequiredKnowledge || []).filter(kw => kw !== inputKeyWord) }))} className='text-sm hover:text-red-600 cursor-pointer' />
                                    </div>
                                })}
                                <AutocompleteInput
                                    onChange={(e) => handleSearchRequiredKnowledge(e.target.value)}
                                    classInput={'!ps-2 !pe-4 outline-none !border-none !shadow-none !h-auto min-w-40 w-full'}
                                    lst={searchTagRs}
                                    value={inputKeyWord}
                                    setValue={setInputKeyWord}
                                    placeholder={'Nhập từ khóa rồi nhấn thêm'}
                                    getValueItem={(item) => item}
                                    displayItem={(item) => item}
                                    optionShowList={searchTagRs?.length > 0}
                                />
                            </div>
                            <div>
                                <button type="button" className='disabled:opacity-60 disabled:pointer-events-none' disabled={isAddKeyWordDisabled()} onClick={handleAddKeyWord}>+ Thêm</button>
                            </div>
                        </div>
                    </div>
                    <div className="field form-full">
                        <label>Gợi ý khóa học</label>
                        <div className="tag-input-row">
                            <div className='gap-1 p-1 border border-[var(--color-border-secondary)] flex flex-row items-center flex-wrap rounded-lg w-full focus-within:border-[var(--color-border-primary)] focus-within:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]'>
                                {course?.suggestCourses?.map((suggestItem, index) => {
                                    return <div key={index} className={`p-1 border border-[var(--color-border-secondary)] rounded-md space-x-1 flex flex-row flex-nowrap items-center`}>
                                        <div className='text-ellipsis overflow-hidden max-w-20' title={suggestItem.code + ' - ' + suggestItem.name}>
                                            <span className='text-nowrap'>{suggestItem.code + ' - ' + suggestItem.name}</span>
                                        </div>

                                        <FontAwesomeIcon icon={faClose} onClick={() => setCourse(prev => ({ ...prev, suggestCourses: (prev.suggestCourses || []).filter(suggest => suggest?.id !== suggestItem?.id) }))} className='text-sm hover:text-red-600 cursor-pointer' />
                                    </div>
                                })}
                                <AutocompleteInput
                                    onChange={(e) => handleSearchSuggestCourse(e.target.value)}
                                    classInput={'!ps-2 !pe-4 outline-none !border-none !shadow-none !h-auto min-w-40 w-full'}
                                    lst={searchSuggestCourse}
                                    value={inputSuggestCourse}
                                    setValue={setInputSuggestCourse}
                                    placeholder={'Nhập khóa học rồi nhấn thêm'}
                                    getValueItem={(item) => item}
                                    displayItem={(item) => {
                                        if (!isObject(item))
                                            return String(item);
                                        else
                                            return item.code + ' - ' + item.name;
                                    }}
                                    optionShowList={true}
                                />
                            </div>
                            <div>
                                <button type="button" className='disabled:opacity-60 disabled:pointer-events-none' disabled={!(isObject(inputSuggestCourse)) || course?.suggestCourses?.find(suggest => suggest.id === inputSuggestCourse.id) !== undefined} onClick={handleAddSuggestCourse}>+ Thêm</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section-card mb-4 p-4">
                <div className="section-title section-color-4 ">Tags</div>
                <div className="form-grid gap-4">
                    <div className="field form-full">
                        <label>Tags khóa học</label>
                        <div className="tag-input-row">
                            <div className='gap-1 p-1 border border-[var(--color-border-secondary)] flex flex-row items-center flex-wrap rounded-lg w-full focus-within:border-[var(--color-border-primary)] focus-within:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]'>
                                {course?.tags?.map((tagItem, index) => {
                                    return <div key={index} className={`p-1 border border-[var(--color-border-secondary)] rounded-md space-x-1 flex flex-row flex-nowrap items-center`}>
                                        <div className='text-ellipsis overflow-hidden max-w-20' title={tagItem}>
                                            <span className='text-nowrap'>{tagItem}</span>
                                        </div>

                                        <FontAwesomeIcon icon={faClose} onClick={() => setCourse(prev => ({ ...prev, tags: (prev.tags || []).filter(tagName => tagName !== tagItem) }))} className='text-sm hover:text-red-600 cursor-pointer' />
                                    </div>
                                })}
                                <AutocompleteInput
                                    onChange={(e) => handleSearchTag(e.target.value)}
                                    classInput={'!ps-2 !pe-4 outline-none !border-none !shadow-none !h-auto min-w-40 w-full'}
                                    lst={searchTagRs}
                                    value={inputTag}
                                    setValue={setInputTag}
                                    placeholder={'Nhập tag rồi nhấn thêm'}
                                    getValueItem={(item) => item}
                                    displayItem={(item) => item}
                                    optionShowList={searchTagRs?.length > 0}
                                />
                            </div>
                            <div>
                                <button type="button" className='disabled:opacity-60 disabled:pointer-events-none' disabled={isAddTagDisabled()} onClick={handleAddTag}>+ Thêm</button>
                            </div>
                        </div>
                        <span className="hint">Thêm tối đa 10 tags để giúp học viên tìm kiếm dễ hơn</span>
                    </div>
                </div>
            </div>

            <div className="action-bar !p-4">
                <div className="action-left">
                    {action === ACTION.CREATE && <button type="button" onClick={handleSaveTemp} className="btn-secondary" >Lưu nháp</button>}
                </div>
                <button type="button" onClick={handlerSave} disabled={deepEquals(course, lstTemp[keyTemp])} className="btn-primary !bg-gray-900 hover:!bg-gray-800 disabled:cursor-default disabled:!opacity-60 disabled:!bg-gray-900" >{ACTION.CREATE === action ? 'Tạo khóa học' : 'Cập nhật khóa học'}</button>
            </div>
        </div>}
    </div>
}

export default CreateOrUpdate;