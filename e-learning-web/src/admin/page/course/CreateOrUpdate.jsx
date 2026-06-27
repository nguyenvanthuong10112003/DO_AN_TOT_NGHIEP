import { toast } from "react-toastify";
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { use, useEffect, useState } from 'react';
import { deepEquals, formatDate, formatDateTime, formatNumber, hasData, isAllNumberOrLatin, isArray, isFunction, isObject, isString, split0, toDouble2CAfter, trimAll, validatePhoto } from '../../../helper/utils';
import { ACTION, DIFFICULT, LANGUAGE, PAGE_LOCATION, LOCAL_STORAGE_KEY, COURSE_TYPE, PHOTO_ALLOWED_TYPE, PHOTO_MAXIMUM_SIZE_MB, RATIOS, PROMOTION_TYPE, COURSE_CERTIFICATE } from '../../../define/define';
import { createOrUpdateCourse, getAllSector, getAllTopic, getCourseById, searchCourse, searchTag } from '../../../service/CourseService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faClock, faClose } from '@fortawesome/free-solid-svg-icons';
import Template1 from '../../../comp/CertificateTemplate/Template1';
import Template2 from '../../../comp/CertificateTemplate/Template2';
import Template3 from '../../../comp/CertificateTemplate/Template3';
import Template4 from '../../../comp/CertificateTemplate/Template4';
import React from "react";
import { removePhoto, uploadTempPhoto } from "../../../service/MediaService";
import { hasUnsavedChangesStore } from "../../../store/HasUnsavedChangesStore";
import AutocompleteInput from "../../../comp/AutocompleteInput";

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
    const [inputTag, setInputTag] = useState('');
    const [inputKeyWord, setInputKeyWord] = useState('');
    const [inputSuggestCourse, setInputSuggestCourse] = useState('')
    const [course, setCourse] = useState(courseConstruct());
    const [errors, setErrors] = useState({})
    const [searchSuggestCourse, setSearchSuggestCourse] = useState([]);
    const [searchTagRs, setSearchTagRs] = useState([]);
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [dragging, setDragging] = useState(false)
    const [current, setCurrent] = useState({});

    useEffect(() => {
        const title = action === ACTION.CREATE ? 'Tạo khóa học' : (action === ACTION.UPDATE && 'Cập nhật khóa học');
        if (isFunction(setTitle)) setTitle(title);
        if (isFunction(setControllers)) setControllers([{ name: 'Quản lý khóa học', url: PAGE_LOCATION.ADMIN_MANAGEMENT_COURSE }, { name: title }]);
        if (action === ACTION.CREATE) {
            setCurrent(structuredClone(course));
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
                    if (c.promotionType === PROMOTION_TYPE.MONEY.id) {
                        c.promotion = formatNumber(c.promotion) || 0
                    } else if (c.promotionType === PROMOTION_TYPE.PERCENT.id) {
                        c.promotion = toDouble2CAfter(c.promotion);
                    }
                    setCourse(structuredClone(c));
                    setCurrent(structuredClone(c));
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
        const isDirty = !deepEquals(course, current);
        hasUnsavedChangesStore.set(isDirty);
    }, [course, current]);

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

        openPopupResizeImage([RATIOS.LANDSCAPE_3_2], file, true, (newFile) => {
            file = newFile;
            uploadTempPhoto([file])
                .then(response => {
                    const photoResponse = response?.data?.data?.[0];
                    setCourse(prev => ({ ...prev, thumbnail: photoResponse.url, thumbnailId: photoResponse.id }));
                }).catch(_ => { })
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
        if (course?.tags?.length === 10) {
            toast.error('Tối đa 10 tags')
            return
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
        if (course?.lstRequiredKnowledge?.length === 10) {
            toast.error('Tối đa 10 từ khóa')
            return
        } 
        setCourse(prev => ({ ...prev, lstRequiredKnowledge: [...(prev.lstRequiredKnowledge || []), newKeyWord] }))
        setInputKeyWord('')
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
        const params = structuredClone(trimAll({ ...course }));
        if (hasData(params.price))
            params.price = Array.from(String(params.price)?.split(''))?.filter(item => item >= '0' && item <= '9')?.join('')
        if (hasData(params.promotionType)) {
            params.promotion = Array.from(String(params.promotion)?.split(''))?.filter(item => item >= '0' && item <= '9')?.join('')
        } else {
            params.promotion = undefined;
            params.promotionType = undefined;
        }
        if (hasData(params.suggestCourses))
            params.suggestCourses = params.suggestCourses.map(c => c.id);
        console.log(params)
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
        openPopupConfirmAlert({
            type: 'warning',
            title: 'Xác nhận cập nhật',
            label: 'Bạn có chắc muốn lưu thay đổi?',
            onAccept: () => {
                createOrUpdateCourse(params)
                    .then(_ => {
                        toast.success(action === ACTION.CREATE ? 'Thêm thành công' : 'Cập nhật thành công')
                        if (ACTION.UPDATE === action) {
                            setCurrent(structuredClone(course));
                        } else {
                            const newCourse = courseConstruct();
                            setCourse(structuredClone(newCourse));
                            setCurrent(structuredClone(newCourse));
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

        if (!hasData(course?.professorName))
            errors.professorName = 'Tên giám đốc đào tạo không được để trống!'
        else if (course.professorName.length > 100)
            errors.professorName = 'Tên giám đốc đào tạo không được quá 100 ký tự!';

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
        else if (course.type === 'PAID') {
            const price = parseFloat(course?.price);
            if (!hasData(price))
                errors.price = 'Giá khóa học không được để trống!'
            else if (price <= 0.0)
                errors.price = 'Giá khóa học không được bé hơn hoặc bằng 0'
            else if (String(parseInt(price)).length > 16)
                errors.price = 'Gía khóa học tối đa 16 ký tự'
            if (hasData(course?.promotionType)) {
                const promotion = parseFloat(course?.promotion)
                if (!hasData(promotion))
                    errors.promotion = 'Khuyến mại không được để trống'
                else if (promotion < 0)
                    errors.promotion = 'Khuyến mại không được bé hơn 0'
                else {
                    if (course.promotionType === PROMOTION_TYPE.MONEY.id) {
                        if (String(parseInt(promotion)).length > 16)
                            errors.promotion = 'Khuyến mại tối đa 16 ký tự'
                        else if (promotion > price)
                            errors.promotion = 'Khuyến mại không được lớn hơn giá sản phẩm'
                    } else if (course.promotionType === PROMOTION_TYPE.PERCENT.id) {
                        if (promotion > 100)
                            errors.promotion = 'Khuyến mại không được lớn hơn 100%'
                    }
                }
            }
        }

        if (course?.issuingCertificate === true) {
            if (!hasData(course?.templateCertificate))
                errors.templateCertificate = 'Mẫu chứng chỉ không được để trống!'
        }

        if (!course?.tags?.length) {
            errors.tags = 'Kiến thức đạt được tối thiểu 1 từ khóa'
        }
        else if (course?.tags?.length > 10) {
            errors.tags = 'Kiến thức đạt được tối đa 10 từ khóa'
        }

        if (course?.suggestCourses?.length > 10) {
            errors.suggestCourses = 'Tối đa 10 khóa học gợi ý'
        }
        
        if (course?.lstRequiredKnowledge?.length > 10) {
            errors.lstRequiredKnowledge = 'Kiến thức cần có tối đa 10 từ khóa'
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
            if (course?.suggestCourses?.length > 10) {
                toast.error("Tối đa 10 gợi ý khóa học");
                return
            }
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
                            <label>Mã khóa học <span style={{ color: "var(--color-text-danger)" }}>*</span></label>
                        </span>
                        <input className={`${errors?.code && '!border-red-600'}`} max={100} type="text" id="f-code" placeholder="Ví dụ: KH01"
                            value={course?.code || ''} onChange={(e) => setCourse(prev => ({ ...prev, code: e.target.value }))} />
                    </div>
                    <div className="field form-full">
                        <span className='flex flex-row'>
                            <label>Tên khóa học <span style={{ color: "var(--color-text-danger)" }}>*</span></label>
                        </span>
                        <input className={`${errors?.name && '!border-red-600'}`} max={100} type="text" id="f-name" placeholder="Ví dụ: Lập trình Python từ cơ bản đến nâng cao"
                            value={course?.name || ''} onChange={(e) => setCourse(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <div className="field form-full @sm:!col-span-1">
                        <label>
                            Lĩnh vực <span style={{ color: "var(--color-text-danger)" }}>*</span>
                            <span className='ms-2 space-x-1'>
                                <input id='check-add-new-sector' className='!w-3 !h-3 !outline-none' type='checkbox' checked={isAddNewSector === true} value={isAddNewSector || ''} onChange={(e) => setIsAddNewSector(prev => !prev)} />
                                <label htmlFor='check-add-new-sector' className='text-sm'>Thêm mới</label>
                            </span>
                        </label>
                        {isAddNewSector === false && <select id="f-field" className={errors?.sector && '!border-red-600'} onChange={handleSectorSelected} value={course?.sectorId || ''}>
                            <option value="">-- Chọn lĩnh vực --</option>
                            {sectors?.map((sector, index) => <option key={index} value={sector.id || ''}>{sector.name}</option>)}
                        </select>}
                        {isAddNewSector === true && <input maxLength={100} className={errors?.newSectorName && '!border-red-600'} placeholder='Nhập tên lĩnh vực mới' value={course?.newSectorName || ''} onChange={(e) => setCourse(prev => ({ ...prev, newSectorName: e.target.value }))} />}
                    </div>
                    <div className="field form-full @sm:!col-span-1">
                        <label>
                            Chủ đề / Danh mục <span style={{ color: "var(--color-text-danger)" }}>*</span>
                            <span className='ms-2 space-x-1'>
                                <input id='check-add-new-topic' className='!w-3 !h-3 !outline-none' type='checkbox' disabled={isAddNewSector === true} checked={isAddNewTopic === true} value={isAddNewTopic || ''} onChange={(e) => setIsAddNewTopic(prev => !prev)} />
                                <label htmlFor='check-add-new-topic' className='text-sm'>Thêm mới</label>
                            </span>
                        </label>
                        {isAddNewTopic === false && <select id="f-topic" onChange={handleTopicSelected} value={course?.topicId || ''}>
                            <option value="">-- Chọn chủ đề --</option>
                            {topics?.map((topic, index) => <option key={index} value={topic.id || ''}>{topic.name}</option>)}
                        </select>}
                        {isAddNewTopic === true && <input maxLength={100} className={errors?.newTopicName && '!border-red-600'} placeholder='Nhập tên chủ đề/danh mục mới' value={course?.newTopicName || ''} onChange={(e) => setCourse(prev => ({ ...prev, newTopicName: e.target.value }))} />}
                    </div>
                    <div className="field form-full">
                        <span className='flex flex-row'>
                            <label>Giảng viên <span style={{ color: "var(--color-text-danger)" }}>*</span></label>
                        </span>
                        <input type="text" placeholder="Nhập tên giám đốc đào tạo" maxLength={100} className={errors?.professorName && '!border-red-600'}
                            value={course?.professorName || ''} onChange={(e) => setCourse(prev => ({ ...prev, professorName: e.target.value }))} />
                    </div>
                    <div className="field form-full">
                        <label>Mô tả ngắn <span style={{ color: "var(--color-text-danger)" }}>*</span></label>
                        <textarea value={course?.description || ''} className={errors?.description && '!border-red-600'} id="f-desc" maxLength={300} placeholder="Mô tả tổng quan về khóa học, nội dung học viên sẽ được học..."
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
                        <label>Độ khó <span style={{ color: "var(--color-text-danger)" }}>*</span></label>
                        <div className="difficulty-group grid grid-cols-2 @sm:grid-cols-4">
                            {Object.keys(DIFFICULT).map((diffKey, index) => <button type="button" key={index} className={`diff-btn btn-secondary w-full ${diffKey === course?.difficult ? 'active' : ''}`} onClick={() => setCourse(prev => ({ ...prev, difficult: diffKey }))}>{DIFFICULT[diffKey]}</button>)}
                        </div>
                    </div>
                    <div className="field form-full">
                        <label>Ngôn ngữ giảng dạy <span style={{ color: "var(--color-text-danger)" }}>*</span></label>
                        <div className="lang-badges">
                            {Object.keys(LANGUAGE).map((lanKey, index) => <button type="button" key={index} className={`btn-secondary lang-badge ${course?.language === lanKey && 'selected'}`} onClick={() => setCourse(prev => ({ ...prev, language: lanKey }))}>{LANGUAGE[lanKey]}</button>)}
                        </div>
                    </div>
                    <div className="form-full grid-cols-3 grid gap-2">
                        <div className="field !col-span-3 @sm:!col-span-1">
                            <label>Loại khóa học <span style={{ color: "var(--color-text-danger)" }}>*</span></label>
                            <div className="price-toggle">
                                <button type="button" className={`pt-btn ${course?.type === 'FREE' && 'active'} hover:bg-white`} id="pt-free" onClick={() => setCourse(prev => ({ ...prev, type: 'FREE', price: undefined, promotionType: undefined, promotion: undefined }))}>Miễn phí</button>
                                <button type="button" className={`pt-btn ${course?.type === 'PAID' && 'active'} hover:bg-white`} id="pt-paid" onClick={() => setCourse(prev => ({ ...prev, type: 'PAID' }))}>Có phí</button>
                            </div>
                        </div>
                        <div className="field !col-span-3 @sm:!col-span-1">
                            <label>Giá (VNĐ) {course?.type === 'PAID' && <span style={{ color: "var(--color-text-danger)" }}>*</span>}</label>
                            <input value={course?.price || ''} maxLength={18} onChange={(e) => {
                                setCourse(prev => ({ ...prev, price: formatNumber(e.target.value.replace(/[^0-9]/g, '')) }));
                            }} inputMode="numeric" pattern="[0-9]*" type="text" className={`disabled:opacity-60 transition-all ${errors?.price && '!border-red-600'}`} placeholder="Ví dụ: 500,000" min="0" disabled={course?.type === 'FREE'} />
                        </div>
                        <div className="!col-span-3 @sm:!col-span-1 field">
                            <label>Khuyến mại {course?.promotionType && <span style={{ color: "var(--color-text-danger)" }}>*</span>}</label>
                            <div className={`border-[1px] border-color-secondary rounded-lg flex flex-row flex-nowrap items-center ${!(course.type === 'PAID') && 'opacity-60'} ${(errors?.promotion || errors?.promotionType) && '!border-red-600'}`}>
                                <input disabled={!course.promotionType || !(course.type === 'PAID')} value={course?.promotion || ''} max={course.promotionType === PROMOTION_TYPE.PERCENT.id ? 100 : undefined} maxLength={course.promotionType === PROMOTION_TYPE.PERCENT.id ? 3 : 16} onChange={(e) => {
                                    setCourse(prev => { const promotion = e.target.value.replace(/[^0-9]/g, ''); return ({ ...prev, promotion: prev.promotionType === PROMOTION_TYPE.MONEY.id ? formatNumber(promotion) : (promotion > 100 ? prev.promotion : (split0(promotion))) }); });
                                }} inputMode="numeric" pattern="[0-9]*" type="text" className={`disabled:opacity-60 transition-all !border-none !h-[38px] !outline-none !shadow-none w-full`} placeholder="100" min="1" />
                                <div className="border-l border-color-secondary !h-[20px]"></div>
                                <select value={course.promotionType || ''} className=" !h-[38px] !border-none !w-auto disabled:opacity-60 !outline-none !shadow-none" disabled={!(course.type === 'PAID')} onChange={e => setCourse(prev => ({...prev, promotionType: e.target.value}))}>
                                    <option value=''>Unit</option>
                                    {Object.values(PROMOTION_TYPE).map((type, index) => <option key={index} value={type.id}>{type?.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="field form-full">
                        <div className="cert-toggle">
                            <button type="button" className={`toggle-sw ${course?.issuingCertificate === true && 'on'}`} id="cert-sw" onClick={() => { setCourse(prev => ({ ...prev, issuingCertificate: !prev.issuingCertificate, templateCertificate: COURSE_CERTIFICATE[0].code })); }}></button>
                            <div>
                                <div className="toggle-label">Cấp chứng chỉ hoàn thành</div>
                                <div className="toggle-sub">Học viên nhận chứng chỉ sau khi hoàn tất khóa học</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {course?.issuingCertificate === true && <div className="section-card mb-4 p-4">
                <div className="section-title section-color-4 ">Chứng chỉ khóa học</div>
                <div className="form-grid gap-4">
                    {course?.templateCertificate && <div className='form-full'>
                        {COURSE_CERTIFICATE.filter((template) => template.code === course?.templateCertificate).map((template, index) => {
                            return <div key={index}>{<template.template professorFullName={course?.professorName} courseName={course?.name} issueDate={formatDate(new Date())} />}</div>
                        })}
                    </div>}
                    <div className="field form-full">
                        <label>Chọn mẫu chứng chỉ <span style={{ color: "var(--color-text-danger)" }}>*</span></label>
                        <div className="flex w-full flex-wrap space-x-2">
                            {COURSE_CERTIFICATE.map((template, index) => {
                                return <button type='button' htmlFor={`certificateTemplate-${index}`} key={index} className={`diff-btn space-x-2 text-center p-2 w-1/4 ${course?.templateCertificate === template.code && 'active'}`} onClick={() => setCourse(prev => ({ ...prev, templateCertificate: template.code }))}>
                                    <span>{template.name}</span>
                                </button>
                            })}
                        </div>
                    </div>
                </div>
            </div>}

            <div className="section-card mb-4 p-4">
                <div className="section-title section-color-4 ">Kiến thức cần có</div>
                <div className="form-grid gap-4">
                    <div className="field form-full">
                        <label>Từ khóa</label>
                        <div className="tag-input-row">
                            <div className={`gap-1 p-1 border border-color-secondary flex flex-row items-center flex-wrap rounded-lg w-full focus-within:border-color-primary focus-within:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] ${errors?.lstRequiredKnowledge && '!border-red-600'}`}>
                                {course?.lstRequiredKnowledge?.map((inputKeyWord, index) => {
                                    return <div key={index} className={`p-1 border border-color-secondary rounded-md space-x-1 flex flex-row flex-nowrap items-center`}>
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
                            <div className={`gap-1 p-1 border border-color-secondary flex flex-row items-center flex-wrap rounded-lg w-full focus-within:border-color-primary focus-within:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] ${errors?.suggestCourses && '!border-red-600'}`}>
                                {course?.suggestCourses?.map((suggestItem, index) => {
                                    return <div key={index} className={`p-1 border border-color-secondary rounded-md space-x-1 flex flex-row flex-nowrap items-center`}>
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
                <div className="section-title section-color-4 ">Kiến thức đạt được </div>
                <div className="form-grid gap-4">
                    <div className="field form-full">
                        <label>Từ khóa <span style={{ color: "var(--color-text-danger)" }}>*</span></label>
                        <div className="tag-input-row">
                            <div className={`gap-1 p-1 border border-color-secondary flex flex-row items-center flex-wrap rounded-lg w-full focus-within:border-color-primary focus-within:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] ${errors?.tags && '!border-red-600'}`}>
                                {course?.tags?.map((tagItem, index) => {
                                    return <div key={index} className={`p-1 border border-color-secondary rounded-md space-x-1 flex flex-row flex-nowrap items-center`}>
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
                                    placeholder={'Nhập từ khóa rồi nhấn thêm'}
                                    getValueItem={(item) => item}
                                    displayItem={(item) => item}
                                    optionShowList={searchTagRs?.length > 0}
                                />
                            </div>
                            <div>
                                <button type="button" className='disabled:opacity-60 disabled:pointer-events-none' disabled={isAddTagDisabled()} onClick={handleAddTag}>+ Thêm</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="action-bar !p-4 !justify-end">
                <button type="button" onClick={handlerSave} disabled={deepEquals(course, current)} className="btn-primary !bg-gray-900 hover:!bg-gray-800 disabled:cursor-default disabled:!opacity-60 disabled:!bg-gray-900" >{ACTION.CREATE === action ? 'Tạo khóa học' : 'Cập nhật khóa học'}</button>
            </div>
        </div>}
    </div>
}

export default CreateOrUpdate;