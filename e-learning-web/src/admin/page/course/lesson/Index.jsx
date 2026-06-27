import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faCheck, faChevronRight, faGear, faInfoCircle, faPen, faPlus, faTrash, faWarehouse } from "@fortawesome/free-solid-svg-icons";
import { LESSON_TYPE, PAGE_LOCATION, QUESTION_TYPE, ScoringMode, TEXT_EDITOR_TOOLBAR_BUTTONS } from "../../../../define/define";
import { createOrUpdateLesson, getCourseById, getCourseDetailById } from "../../../../service/CourseService";
import TextEditor from "../../../../comp/TextEditor";
import { deepEquals, hasData, isQuestionTypeChoice, isString, split0, trimAll } from "../../../../helper/utils";
import React from "react";
import RenderTestForm from "../../../../comp/LessonForm/RenderTestForm";
import RenderVideoForm from "../../../../comp/LessonForm/RenderVideoForm";
import SortableLessonItem from "../../../../comp/SortableLessonItem";
import { useDroppable } from '@dnd-kit/core';

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { hasUnsavedChangesStore } from "../../../../store/HasUnsavedChangesStore";
import { toast } from "react-toastify";

const constructLesson = (chapterId, num) => {
    return {
        id: Date.now(),
        type: Object.values(LESSON_TYPE)[0].id,
        chapterId,
        number: num
    }
}

const LessonIndex = () => {
    const { courseId } = useParams();
    const {
        handleReset,
        setTitle,
        setIsMainFull,
        openPopupConfirmAlert,
        openPopupUploadImage,
        openPopupTextEditor,
        scrollToId
    } = useOutletContext();
    const parser = new DOMParser();
    const navigate = useNavigate();
    const [course, setCourse] = useState({});
    const [chapteres, setChapteres] = useState([])
    const [lesson, setLesson] = useState(undefined);
    const [expands, setExpands] = useState({})
    const [isDragging, setIsDragging] = useState(false);
    const [current, setCurrent] = useState([]);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 }, // tránh trigger khi click
        })
    );

    useEffect(() => {
        const isDirty = !deepEquals(current, chapteres);
        hasUnsavedChangesStore.set(isDirty);
    }, [current, chapteres]);

    useEffect(() => {
        if (!isDragging) return;
        const prevent = (e) => e.preventDefault();
        window.addEventListener('wheel', prevent, { passive: false });
        window.addEventListener('touchmove', prevent, { passive: false });
        return () => {
            window.removeEventListener('wheel', prevent);
            window.removeEventListener('touchmove', prevent);
        };
    }, [isDragging]);

    useEffect(() => {
        setTitle?.('Quản lý bài học')
        setIsMainFull?.(true)
        getCourseDetailById(courseId)
            .then(res => {
                setCourse(res.data.data)
                setChapteres(structuredClone(res.data.data.chapters || []))
                setCurrent(structuredClone(res.data.data.chapters || []))
            })
            .catch(_ => { })

        return () => {
            handleReset?.()
        }
    }, [courseId])

    useEffect(() => {
        if (!lesson || !chapteres || !lesson.chapterId) return;
        const chapterIndex = chapteres.findIndex(chap => chap.id === lesson.chapterId)
        if (chapterIndex === -1) return;
        const lessonIndex = chapteres[chapterIndex].lessons?.findIndex(less => less.id === lesson.id)
        if (lessonIndex === -1) return;
        setChapteres(prev => {
            prev[chapterIndex].lessons[lessonIndex] = lesson;
            return [...prev];
        })
    }, [lesson])

    const addQuestion = (newQuestion) => {
        if (!newQuestion || lesson.type !== LESSON_TYPE.TEST.id) return;
        const clone = setupQuestion(newQuestion);
        setLesson(prev => ({ ...prev, test: { ...prev.test, questions: [...(prev.test.questions || []), { id: Date.now(), ...clone }] } }))
    }

    const removeQuestion = (questionId) => {
        if (!questionId || !lesson?.test?.questions || lesson.type !== LESSON_TYPE.TEST.id) return;
        setLesson(prev => ({ ...prev, test: { ...prev.test, questions: prev.test.questions.filter(question => question.id !== questionId) } }))
    }

    const updateQuestion = (question) => {
        if (!question || !lesson?.test?.questions || lesson.type !== LESSON_TYPE.TEST.id) return;
        const clone = setupQuestion(question);
        setLesson(prev => ({
            ...prev, test: {
                ...prev.test, questions: prev.test.questions.map(q => {
                    if (q.id === clone.id) return clone;
                    return q;
                })
            }
        }))
    }

    const setupQuestion = (question) => {
        const { answers, answer, instruction, ...clone } = { ...question };
        if (isQuestionTypeChoice(clone.type))
            clone.answers = answers;
        else if (clone.type === QUESTION_TYPE.ARGUMENT.id) {
            clone.answer = answer;
            clone.instruction = instruction;
        }
        else return;
        return clone;
    }

    const setVideo = (video) => {
        if (video === undefined || video === null || LESSON_TYPE.VIDEO.id !== lesson.type) return

        setLesson(prev => {
            const duration = Math.ceil(video.videoInfo?.duration / 60)
            prev.duration = duration;
            return ({ ...prev, video: { ...video } })
        })
    }

    const handleChangeType = (id) => {
        setLesson(prev => {
            prev.type = id;
            if (prev.type === LESSON_TYPE.VIDEO.id)
                prev.video = prev.video || {}
            else if (prev.type === LESSON_TYPE.TEST.id)
                prev.test = { ...(prev.test || {}), questions: prev.test?.questions || [] }
            else if (prev.type === LESSON_TYPE.ARTICLE.id)
                prev.article = prev.article || {}
            return { ...prev }
        })
    }

    const handleAddChapter = () => {
        openPopupConfirmAlert({
            type: 'info',
            title: 'Thêm mới chương',
            label: 'Tên chương',
            inputUse: 'true',
            inputType: 'text',
            inputRequired: true,
            iconUse: false,
            inputPlacholder: 'Nhập tên chương',
            validate: (chapterName) => {
                const name = chapterName?.trim()
                if (!name || name.length === 0 || name.length > 100)
                    return 'Tên chương không được để trống và không quá 100 ký tự'
                if (chapteres?.some(chap => chap.name === name))
                    return 'Tên chương đã được sử dụng'
                return false;
            },
            onAccept: (newChapterName) => {
                setChapteres(prev => ([...(prev || []), { id: Date.now(), name: newChapterName.trim() }]))
            }
        })
    }

    const handleEditChapter = (chapterId) => {
        const chapIndex = chapteres.findIndex(c => c.id === chapterId)
        if (chapIndex === -1) return;
        openPopupConfirmAlert({
            type: 'info',
            title: 'Cập nhật chương',
            label: 'Tên chương',
            inputUse: 'true',
            inputType: 'text',
            inputRequired: true,
            iconUse: false,
            inputPlacholder: 'Nhập tên chương',
            value: chapteres[chapIndex].name,
            validate: (chapterName) => {
                const name = chapterName?.trim()
                if (!name || name.length === 0 || name.length > 100)
                    return 'Tên chương không được để trống và không quá 100 ký tự'
                if (chapteres?.some(chap => chap.name === name && chap.id !== chapterId))
                    return 'Tên chương đã được sử dụng'
                return false;
            },
            onAccept: (newChapterName) => {
                setChapteres(prev => {
                    prev[chapIndex].name = newChapterName.trim()
                    return [...prev];
                })
            }
        })
    }

    const handleRemoveChapter = (chapterId) => {
        const chapIndex = chapteres.findIndex(c => c.id === chapterId)
        if (chapIndex === -1) return;
        openPopupConfirmAlert({
            type: 'warning',
            title: 'Xác nhận xóa',
            label: 'Các khóa học trong chương sẽ bị xóa, bạn có muốn tiếp tục?',
            onAccept: (newChapterName) => {
                setChapteres(prev => {
                    return [...prev.filter(c => c.id !== chapterId)];
                })
                if (lesson?.chapterId === chapterId)
                    setLesson(undefined)
            }
        })
    }

    const handleAddLesson = (chapterId) => {
        const chapIndex = chapteres.findIndex(c => c.id === chapterId)
        if (chapIndex === -1) return;
        const newLesson = constructLesson(chapterId, (chapteres[chapIndex].lessons?.length || 0) + 1);
        setChapteres(prev => {
            prev[chapIndex].lessons = [...(prev[chapIndex].lessons || []), newLesson]
            return [...prev];
        })
        if (!lesson) setLesson(newLesson);
    }

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        // Tìm chương chứa lesson đang kéo (source)
        const sourceChapter = chapteres.find(ch =>
            ch.lessons?.some(l => l.id === active.id)
        );

        // Tìm chương đích — over.id có thể là lesson.id hoặc chapter.id (SortableContext id)
        const destChapter = chapteres.find(ch =>
            ch.lessons?.some(l => l.id === over.id) || ch.id === over.id
        );

        if (!sourceChapter || !destChapter) return;

        const draggedLesson = sourceChapter.lessons.find(l => l.id === active.id);

        if (sourceChapter.id === destChapter.id) {
            // Kéo trong cùng chương — đổi vị trí
            const oldIndex = sourceChapter.lessons.findIndex(l => l.id === active.id);
            const newIndex = sourceChapter.lessons.findIndex(l => l.id === over.id);

            setChapteres(prev =>
                prev.map(ch =>
                    ch.id === sourceChapter.id
                        ? {
                            ...ch, lessons: arrayMove(ch.lessons, oldIndex, newIndex).map((less, index) => {
                                if (less.id === lesson?.id) setLesson(prev => ({ ...prev, number: index + 1 }))
                                return { ...less, number: index + 1 };
                            })
                        }
                        : ch
                )
            );
        } else {
            const overIndex = destChapter.lessons?.findIndex(l => l.id === over.id) ?? -1;

            setChapteres(prev =>
                prev.map(ch => {
                    if (ch.id === sourceChapter.id) {
                        // Xóa khỏi chương cũ
                        return { ...ch, lessons: ch.lessons.filter(l => l.id !== active.id).map((lesson, index) => ({ ...lesson, number: index + 1 })) };
                    }
                    if (ch.id === destChapter.id) {
                        // Chèn vào vị trí đúng trong chương mới
                        const newLessons = [...(ch.lessons || [])];
                        const insertAt = overIndex >= 0 ? overIndex : newLessons.length;
                        newLessons.splice(insertAt, 0, draggedLesson);
                        return {
                            ...ch, lessons: newLessons.map((less, index) => {
                                if (less.id === lesson?.id) setLesson(prev => ({ ...prev, number: index + 1, chapterId: ch.id }))
                                return { ...less, number: index + 1 }
                            })
                        };
                    }
                    return ch;
                })
            );
        }
    };

    const handleRemoveLesson = (lessonId) => {
        let chapIndex = -1, lessonIndex = -1;
        for (let i = 0; i < chapteres.length; i++) {
            const chapter = chapteres[i];
            if (!chapter || !chapter.lessons || chapter.lessons.length === 0) continue;
            for (let j = 0; j < chapter.lessons.length; j++) {
                if (chapter.lessons[j].id !== lessonId) continue;
                chapIndex = i;
                lessonIndex = j;
                break;
            }
        }
        if (chapIndex === -1 || lessonIndex === -1) return;
        openPopupConfirmAlert({
            type: 'warning',
            title: 'Xác nhận xóa',
            label: 'Khóa học sẽ bị xóa, bạn có muốn tiếp tục?',
            onAccept: (newChapterName) => {
                setChapteres(prev => {
                    prev[chapIndex].lessons = prev[chapIndex].lessons.filter(less => less.id !== lessonId)
                    return [...prev];
                })
                if (lessonId === lesson.id) setLesson(undefined)
            }
        })
    }

    const handleToPrev = () => {
        if (!lesson || lesson.number === 1) return;
        const chap = chapteres.find(c => c.id === lesson.chapterId)
        setLesson(chap.lessons[lesson.number - 1 - 1])
    }

    const handleToNext = () => {
        if (!lesson) return;
        const chap = chapteres.find(c => c.id === lesson.chapterId)
        if (lesson.number === chap.lessons.length) return;
        setLesson(chap.lessons[lesson.number])
    }

    const handleSave = async () => {
        const chaptersRequest = structuredClone(trimAll(chapteres || []));

        for (let i = 0; i < chaptersRequest.length; i++) {
            const chap = chaptersRequest[i];
            chap.lessons = (chap.lessons || []).map(less => {
                let { id, name, description, type, duration, article, test, video, passScore, requireFinish, canPreview, showAnswer, isMix, scoringMode } = { ...(less || {}) };
                if (type === LESSON_TYPE.ARTICLE.id) {
                    const {
                        content,
                        photos
                    } = parseContentPhotos(article?.content);
                    return { id, name, description, type, duration, article: { ...(article || {}), content, photos }, requireFinish, canPreview };
                }
                if (type === LESSON_TYPE.VIDEO.id)
                    return { id, name, description, type, video, requireFinish, canPreview };
                if (type === LESSON_TYPE.TEST.id) {
                    let questions = [];
                    for (const question of test?.questions || []) {
                        let { answers, answer, instruction, ...cloneQuestion } = { ...(question || {}) };
                        const {
                            content,
                            photos
                        } = parseContentPhotos(question?.content);
                        if (isQuestionTypeChoice(question?.type)) {
                            cloneQuestion.answers = answers;
                        }
                        else if (question?.type === QUESTION_TYPE.ARGUMENT.id) {
                            cloneQuestion.answer = answer;
                            cloneQuestion.instruction = instruction;
                        }
                        questions.push({ ...cloneQuestion, content, photos });
                    }
                    return { id, name, description, type, duration, test: { ...(test || {}), questions }, passScore, requireFinish, canPreview, showAnswer, isMix, scoringMode };
                }
                return { id, name, description, type, duration, requireFinish, canPreview };
            })
        }

        const error = validate(chaptersRequest);
        if (isString(error)) {
            toast.error(error);
            return;
        }

        const callBack = async () => {
            try {
                const response = await createOrUpdateLesson(courseId, chaptersRequest);
                toast.success('Lưu bài học thành công');
                setChapteres(structuredClone(response.data.data || []));
                setCurrent(structuredClone(response.data.data || []));
            } catch { }
        }

        openPopupConfirmAlert({
            type: 'info',
            title: 'Xác nhận lưu',
            label: 'Bạn có chắc muốn lưu thay đổi?',
            onAccept: callBack
        })
    }

    const parseContentPhotos = (html) => {
        const doc = parser.parseFromString(html || '', 'text/html');
        const photos = {};

        doc.querySelectorAll('img').forEach(img => {
            const imageObjStr = img.getAttribute('imageObj');

            try {
                const imageObj = JSON.parse(imageObjStr);

                if (!imageObj?.id) return;

                photos[imageObj.id] = imageObj;

                if (!imageObj.isActive) {
                    img.setAttribute(
                        'imageObj',
                        JSON.stringify({
                            ...imageObj,
                            isActive: true
                        })
                    );
                }
            } catch (e) {
                console.log('Invalid imageObj', imageObjStr);
            }
        });

        return {
            content: doc.body.innerHTML,
            photos: Object.values(photos)
        };
    };

    const validate = (chapters) => {
        if (!chapters || !Array.isArray(chapters) || chapters.length === 0) return 'Chương trình học không được để trống';
        const singleChapterName = {};
        for (let i = 0; i < chapters.length; i++) {
            const chap = chapters[i];
            if (!chap.name || chap.name.trim().length === 0) return `Tên chương ở vị trí ${i + 1} không được để trống`;
            if (chap.name.length > 100) return `Tên chương ở vị trí ${i + 1} không được quá 100 ký tự`;
            if (singleChapterName[chap.name]) return `Tên chương ở vị trí ${i + 1} đã tồn tại`;
            singleChapterName[chap.name] = true;
            if (!chap.lessons || chap.lessons.length === 0) return `Chương ${chap.name} phải có ít nhất 1 bài học`;
            const singleLessonName = {};
            for (let j = 0; j < chap.lessons.length; j++) {
                const less = chap.lessons[j];
                if (!less.name || less.name.trim().length === 0 || less.name.length > 100) return `Tên bài học ở vị trí ${j + 1} của chương ${chap.name} không được để trống và không được quá 100 ký tự`;
                if (!less.description || less.description.trim().length === 0 || less.description.length > 300) return `Mô tả bài học ở vị trí ${j + 1} của chương ${chap.name} không được để trống và không được quá 300 ký tự`;
                if (singleLessonName[less.name]) return `Tên bài học ở vị trí ${j + 1} của chương ${chap.name} đã tồn tại`;
                singleLessonName[less.name] = true;
                if (!less.type || !Object.values(LESSON_TYPE).some(t => t.id === less.type)) return `Loại bài học ở vị trí ${j + 1} của chương ${chap.name} không hợp lệ`;
                if (less.type !== LESSON_TYPE.VIDEO.id && (!less.duration || less.duration <= 0)) return `Thời lượng bài học ở vị trí ${j + 1} của chương ${chap.name} phải lớn hơn 0`;
                if (less.type === LESSON_TYPE.ARTICLE.id) {
                    if (!less.article || !less.article.content || less.article.content.trim().length === 0) return `Bài học văn bản ở vị trí ${j + 1} của chương ${chap.name} phải có nội dung`;
                    if (less.article.photos && less.article.photos.length > 0) {
                        for (let k = 0; k < less.article.photos.length; k++) {
                            const photo = less.article.photos[k];
                            if (!photo.url) return `Ảnh trong bài học văn bản ở vị trí ${j + 1} của chương ${chap.name} có url không hợp lệ`;
                            if (!photo.id) return `Ảnh trong bài học văn bản ở vị trí ${j + 1} của chương ${chap.name} có id không hợp lệ`;
                        }
                    }
                }
                if (less.type === LESSON_TYPE.VIDEO.id) {
                    if (!less.video || !less.video.videoInfo) return `Bài học video ở vị trí ${j + 1} của chương ${chap.name} phải có video`;
                    if (!less.video.videoInfo.id) return `Bài học video ở vị trí ${j + 1} của chương ${chap.name} có video không hợp lệ`;
                    if (!less.video.videoInfo.duration || less.video.videoInfo.duration <= 0) return `Bài học video ở vị trí ${j + 1} của chương ${chap.name} có video không hợp lệ`;
                    if (!less.video.videoInfo.quality || less.video.videoInfo.quality <= 0) return `Bài học video ở vị trí ${j + 1} của chương ${chap.name} có video không hợp lệ`;
                    if (!less.video.qualityDefault || less.video.qualityDefault <= 0) return `Bài học video ở vị trí ${j + 1} của chương ${chap.name} phải có chất lượng mặc định`;
                    if (less.video.qualityDefault > less.video.videoInfo.quality) return `Chất lượng mặc định của bài học video ở vị trí ${j + 1} của chương ${chap.name} không được lớn hơn chất lượng video`;
                    if (!less.video.summary || less.video.summary.trim().length === 0 || less.video.summary.length > 300) return `Bài học video ở vị trí ${j + 1} của chương ${chap.name} phải có tóm tắt và tóm tắt không được quá 300 ký tự`;
                }
                if (less.type === LESSON_TYPE.TEST.id) {
                    const passScore = parseFloat(less.passScore);
                    if (!less.test.questions || less.test.questions.length === 0) return `Bài học kiểm tra ở vị trí ${j + 1} của chương ${chap.name} phải có ít nhất 1 câu hỏi`;
                    if (!less.passScore || passScore <= 0) return `Điểm đạt của bài học kiểm tra ở vị trí ${j + 1} của chương ${chap.name} phải lớn hơn 0`;
                    if (!less.scoringMode) return 'Hình thức chấm điểm không đượcc để trống';
                    let totalScore = 0;
                    for (let k = 0; k < less.test.questions.length; k++) {
                        const ques = less.test.questions[k];
                        const quesScore = parseFloat(ques.score);
                        totalScore += (quesScore || 0);
                        if (!ques.score || quesScore <= 0) return `Điểm của câu hỏi ở vị trí ${k + 1} của bài học kiểm tra ${less.name} phải lớn hơn 0`;
                        if (!ques.content || ques.content.trim().length === 0) return `Nội dung câu hỏi ở vị trí ${k + 1} của bài học kiểm tra ${less.name} phải có nội dung`;
                        if (!ques.type || !Object.values(QUESTION_TYPE).some(t => t.id === ques.type)) return `Loại câu hỏi ở vị trí ${k + 1} của bài học kiểm tra ${less.name} không hợp lệ`;
                        if (ques.explain && ques.explain.trim().length > 300) return `Câu hỏi ở vị trí ${k + 1} của bài học kiểm tra ${less.name} phải có giải thích không được quá 300 ký tự`;
                        if (isQuestionTypeChoice(ques.type)) {
                            if (!ques.answers || ques.answers.length < 2) return `Câu hỏi lựa chọn ở vị trí ${k + 1} của bài học kiểm tra ${less.name} phải có ít nhất 2 đáp án`;
                            let correctCount = 0;
                            for (let m = 0; m < ques.answers.length; m++) {
                                const ans = ques.answers[m];
                                if (!ans.content || ans.content.trim().length === 0 || ans.content.trim().length > 100) return `Nội dung đáp án ở vị trí ${m + 1} của câu hỏi ${k + 1} trong bài học kiểm tra ${less.name} phải có nội dung từ 1 đến 100 ký tự`;
                                if (ans.isCorrect) correctCount++;
                            }
                            if (correctCount === 0) return `Câu hỏi lựa chọn ở vị trí ${k + 1} của bài học kiểm tra ${less.name} phải có ít nhất 1 đáp án đúng`;
                            if (ques.type === QUESTION_TYPE.CHOICE.id && correctCount > 1) return `Câu hỏi lựa chọn một ở vị trí ${k + 1} của bài học kiểm tra ${less.name} chỉ được có 1 đáp án đúng`;
                        }
                        else if (ques.type === QUESTION_TYPE.ARGUMENT.id) {
                            if (!ques.answer || ques.answer.trim().length === 0 || ques.answer.trim().length > 100) return `Câu hỏi tự luận ở vị trí ${k + 1} của bài học kiểm tra ${less.name} phải có đáp án từ 1 đến 100 ký tự`;
                            if (ques.instruction && ques.instruction.trim().length > 300) return `Câu hỏi tự luận ở vị trí ${k + 1} của bài học kiểm tra ${less.name} phải có hướng dẫn trả lời không được quá 300 ký tự`;
                        }
                        if (ques.photos && ques.photos.length > 0) {
                            for (let m = 0; m < ques.photos.length; m++) {
                                const photo = ques.photos[m];
                                if (!photo.url) return `Ảnh trong câu hỏi ở vị trí ${k + 1} của bài học kiểm tra ${less.name} có url không hợp lệ`;
                                if (!photo.id) return `Ảnh trong câu hỏi ở vị trí ${k + 1} của bài học kiểm tra ${less.name} có id không hợp lệ`;
                            }
                        }
                    }
                    if (totalScore < passScore) return `Tổng điểm của bài học kiểm tra ${less.name} phải lớn hơn hoặc bằng điểm đạt`;
                }
            }
        }
        return false;
    }

    return <div className="wrap p-4">
        <div className="topbar !items-start bg-white p-4 section-card flex-col flex-wrap @xs:flex-row">
            <button className="back-btn" type="button" onClick={_ => navigate(PAGE_LOCATION.ADMIN_DETAIL_COURSE(courseId))} >
                <FontAwesomeIcon icon={faArrowLeft} />Khóa học</button>
            <div className="det-title-block">
                <div className="det-title capitalize" id="det-name">{course.name}</div>
                <div className="det-breadcrumb capitalize">{course.description}</div>
            </div>
            <div>
                <button onClick={handleSave} disabled={deepEquals(current, chapteres)} type="button" className="btn-pub !bg-gray-700 disabled:opacity-60 disabled:pointer-events-none"><FontAwesomeIcon icon={faCheck} />Lưu</button>
            </div>
        </div>

        <hr className="my-4"></hr>

        {hasData(course) && <div className="layout !grid-cols-1 @md:![grid-template-columns:1fr_300px]">

            {lesson && <div className="main-panel order-2 @md:order-1 gap-4">

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
                                    onClick={_ => handleChangeType(type.id)}
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
                            <label>Tên bài học <span className="text-red-500">*</span></label>
                            <input type="text" maxLength={100} placeholder="Nhập tên bài học..."
                                value={lesson.name || ''}
                                onChange={e => setLesson(prev => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className="field col-span-full @xs:col-span-1">
                            <label>Thuộc chương <span className="text-red-500">*</span></label>
                            <select disabled={true} value={lesson.chapterId || ''} >
                                {chapteres.map((chap, index) => <option key={index} value={chap.id || ''}>{chap.name}</option>)}
                            </select>
                        </div>
                        <div className="field col-span-full @xs:col-span-1">
                            <label>Thứ tự trong chương <span className="text-red-500">*</span></label>
                            <input disabled={true} type="number" value={lesson.number || ''} min="1" />
                        </div>
                        <div className="field form-full">
                            <label>Mô tả ngắn <span className="text-red-500">*</span></label>
                            <textarea value={lesson.description || ''} maxLength={300} className="!p-2" rows="2" placeholder="Học viên sẽ học được gì trong bài này..."
                                onChange={e => setLesson(prev => ({ ...prev, description: e.target.value }))}></textarea>
                        </div>
                    </div>
                </div>

                {lesson.type === LESSON_TYPE.ARTICLE.id && <div className="section-card overflow-hidden">
                    <TextEditor content={lesson?.article?.content} onChange={text => setLesson(prev => ({ ...prev, article: { content: text } }))} openPopupUploadImage={openPopupUploadImage} groupsBtn={Object.values(TEXT_EDITOR_TOOLBAR_BUTTONS).reduce((list, item) => [...list, item], [])} />
                </div>}

                {lesson.type === LESSON_TYPE.VIDEO.id && <RenderVideoForm video={lesson?.video} setVideo={setVideo} />}
                {lesson.type === LESSON_TYPE.TEST.id && <RenderTestForm questions={lesson?.test?.questions} addQuestion={addQuestion} updateQuestion={updateQuestion} removeQuestion={removeQuestion} openPopupConfirmAlert={openPopupConfirmAlert} openPopupTextEditor={openPopupTextEditor} scrollToId={scrollToId} />}

                <div className="section-card p-4">
                    <div className="section-title section-color-4"><FontAwesomeIcon icon={faGear} />Cài đặt bài học</div>
                    <div className="form-grid !grid-cols-4 gap-4">
                        <div className={`field col-span-full @sm:col-span-1 ${LESSON_TYPE.TEST.id !== lesson.type && '!col-span-full'}`}>
                            <label>Thời lượng (phút) <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                maxLength={4}
                                placeholder="15"
                                value={lesson?.duration || ''}
                                onChange={(e) => {
                                    setLesson(prev => ({ ...prev, duration: split0(e.target.value.replace(/[^0-9]/g, '') || '') }));
                                }}
                                min="1"
                                disabled={lesson.type === LESSON_TYPE.VIDEO.id}
                            />
                        </div>
                        {LESSON_TYPE.TEST.id === lesson.type && <>
                            <div className="field col-span-full @sm:col-span-1">
                                <label>Chấm điểm <span className="text-red-500">*</span></label>
                                <select value={lesson?.scoringMode} onChange={e => setLesson(prev => ({ ...prev, scoringMode: e.target.value }))}>
                                    <option value=''>Chọn hình thức</option>
                                    {Object.values(ScoringMode).map((mode, index) =>
                                        <option key={index} value={mode.key}>{mode.label}</option>)
                                    }
                                </select>
                            </div>
                            <div className="field col-span-full @sm:col-span-1">
                                <label>Điểm tối đa</label>
                                <input type="text" placeholder="100" disabled={true} value={lesson?.test?.questions?.reduce((total, v) => total + (parseFloat(v.score) || 0), 0)?.toFixed(2) || ''} />
                            </div>
                            <div className="field col-span-full @sm:col-span-1">
                                <label>Điểm đạt <span className="text-red-500">*</span></label>
                                <input maxLength={16} type="text" value={lesson?.passScore || ''} placeholder="70" onChange={e => setLesson(prev => ({ ...prev, passScore: split0(e.target.value.replace(/[^0-9.]/g, '').replace(/^(\d*\.?\d{0,2}).*$/, '$1') || '0') }))} />
                            </div>
                        </>
                        }

                        <div className="form-full " >
                            <div className="cert-toggle ">
                                <div className={`toggle-sw cursor-pointer ${lesson.requireFinish && 'on'}`}
                                    onClick={_ => setLesson(prev => ({ ...prev, requireFinish: !prev.requireFinish }))}></div>
                                <div>
                                    <div className="toggle-label">Bắt buộc hoàn thành</div>
                                    <div className="toggle-sub">Học viên phải xong bài này mới mở bài tiếp</div>
                                </div>
                            </div>
                        </div>
                        <div className="form-full " >
                            <div className="cert-toggle ">
                                <div className={`toggle-sw cursor-pointer ${lesson.canPreview && 'on'}`}
                                    onClick={_ => setLesson(prev => ({ ...prev, canPreview: !prev.canPreview }))}></div>
                                <div>
                                    <div className="toggle-label">Cho phép xem trước</div>
                                    <div className="toggle-sub">Học viên chưa đăng ký vẫn xem được bài này</div>
                                </div>
                            </div>
                        </div>
                        {lesson.type === LESSON_TYPE.TEST.id && <div className="form-full " >
                            <div className="cert-toggle ">
                                <div className={`toggle-sw cursor-pointer ${lesson.showAnswer && 'on'}`}
                                    onClick={_ => setLesson(prev => ({ ...prev, showAnswer: !prev.showAnswer }))}></div>
                                <div>
                                    <div className="toggle-label">Hiển thị đáp án</div>
                                    <div className="toggle-sub">Hiện đáp án đúng sau khi nộp bài</div>
                                </div>
                            </div>
                        </div>}
                        {lesson.type === LESSON_TYPE.TEST.id && <div className="form-full " >
                            <div className="cert-toggle ">
                                <div className={`toggle-sw cursor-pointer ${lesson.isMix && 'on'}`}
                                    onClick={_ => setLesson(prev => ({ ...prev, isMix: !prev.isMix }))}></div>
                                <div>
                                    <div className="toggle-label">Trộn câu hỏi</div>
                                    <div className="toggle-sub">Ngẫu nhiên thứ tự câu hỏi mỗi lần thi</div>
                                </div>
                            </div>
                        </div>}
                    </div>
                </div>

                <div className="section-card p-4 flex flex-col @sm:flex-row justify-between items-center">
                    <button onClick={handleToPrev} disabled={lesson.number === 1} className="btn-prev disabled:pointer-events-none disabled:opacity-60"><FontAwesomeIcon icon={faArrowLeft} />Bài trước</button>

                    {<span className="lesson-progress" id="lesson-prog">Bài {lesson.number}/{chapteres.find(chap => chap.id === lesson.chapterId)?.lessons?.length || 0}</span>}

                    <button onClick={handleToNext} disabled={chapteres.find(chap => chap.id === lesson.chapterId)?.lessons?.length === lesson.number} className="btn-next !bg-gray-700 disabled:pointer-events-none disabled:opacity-60">Bài tiếp theo<FontAwesomeIcon icon={faArrowRight} /></button>
                </div>

            </div>}

            {!lesson && <div className="main-panel order-2 @md:order-1 gap-4">
                <div className="section-card p-4">
                    <p className="text-gray-500">Chọn bài học để chỉnh sửa!</p>
                </div>
            </div>}

            <div className={`sidebar order-1 @md:order-2 pb-1`}>
                <div className="sb-head space-y-2 !bg-white">
                    <span className="section-title text-nowrap !mb-0">Chương trình học</span>
                    <button className="sb-add-ch text-nowrap !text hover:!bg-gray-50" onClick={handleAddChapter}>
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm chương
                    </button>
                </div>

                {chapteres?.length > 0 &&
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        modifiers={[restrictToVerticalAxis]}
                        autoScroll={false}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={(e) => { setIsDragging(false); handleDragEnd(e); }}
                        onDragCancel={() => setIsDragging(false)}
                    >
                        <div id="chapter-tree" className="max-h-[50vh] overflow-auto">
                            {chapteres.map((chapter, i) => (
                                <div key={chapter.id} className="chapter-block">
                                    <div className="ch-header" title={chapter.name} onClick={_ => setExpands(prev => ({ ...prev, [chapter.id]: !prev[chapter.id] }))} >
                                        <FontAwesomeIcon
                                            icon={faChevronRight}
                                            className={`ch-icon transition-transform duration-200 ${expands[chapter.id] && 'open'}`}
                                            id="ch-icon-1"
                                        />
                                        <span className="ch-count !w-6 !h-6 flex items-center justify-center">{chapter.lessons?.length || 0}</span>
                                        <span className="ch-name">{chapter.name}</span>
                                        <button type="button" onClick={e => { e.stopPropagation(); handleRemoveChapter(chapter.id) }} className="hover:opacity-60">
                                            <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                                        </button>
                                        <button type="button" onClick={e => { e.stopPropagation(); handleEditChapter(chapter.id) }} className="hover:opacity-60">
                                            <FontAwesomeIcon icon={faPen} className="text-blue-500" />
                                        </button>
                                    </div>

                                    {expands[chapter.id] && (
                                        <div>
                                            <div className="lesson-list">
                                                <SortableContext
                                                    id={chapter.id}
                                                    items={chapter.lessons?.map(l => l.id) || []}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    {
                                                        chapter.lessons?.length > 0
                                                            ? chapter.lessons.map((less) => (
                                                                <SortableLessonItem
                                                                    key={less.id}
                                                                    lessonItem={less}
                                                                    lesson={lesson}
                                                                    setLesson={(lesson) => { setLesson(structuredClone(lesson)); }}
                                                                    removeLesson={() => handleRemoveLesson(less.id)}
                                                                />
                                                            ))
                                                            : <DroppableChapter chapterId={chapter.id} />
                                                    }
                                                </SortableContext>
                                            </div>
                                            <div className="add-lesson-row">
                                                <button className="add-lesson-btn hover:opacity-80" onClick={() => handleAddLesson(chapter.id)}>
                                                    <FontAwesomeIcon className="text-xs" icon={faPlus} /> Thêm bài học
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </DndContext>}
                {!chapteres?.length && (
                    <div className="p-4">
                        <p className="text-gray-500">Chưa có chương nào!</p>
                    </div>
                )}
            </div >
        </div>}
    </div>
}

function DroppableChapter({ chapterId }) {
    const { setNodeRef, isOver } = useDroppable({ id: chapterId });
    return (
        <div
            ref={setNodeRef}
            className={`h-0 rounded transition-colors ${isOver ? 'bg-blue-50 border border-dashed border-blue-300' : 'border border-dashed border-gray-200'}`}
        />
    );
}

export default LessonIndex;