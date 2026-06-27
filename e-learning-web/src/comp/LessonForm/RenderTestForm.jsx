import { faArrowUpRightFromSquare, faCheck, faChevronDown, faClose, faListCheck, faPen, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { buildEditorConfig, deepEquals, hasData, isObject, isQuestionTypeChoice, split0, trimAll } from "../../helper/utils";
import { QUESTION_TYPE, TEXT_EDITOR_TOOLBAR_BUTTONS } from "../../define/define";
import { toast } from "react-toastify";

const newQuestion = () => {
    return {
        content: '',
        score: ''
    }
}
const newAnswerChoice = () => {
    return { id: Date.now(), content: '', isCorrect: false }
}
const fastEditorButtons = [
    { ...TEXT_EDITOR_TOOLBAR_BUTTONS.HISTORY },
    { ...TEXT_EDITOR_TOOLBAR_BUTTONS.FORMATTING },
    { ...TEXT_EDITOR_TOOLBAR_BUTTONS.ALIGN },
    { 'IMAGE': TEXT_EDITOR_TOOLBAR_BUTTONS.INSERT.IMAGE },
    { ...TEXT_EDITOR_TOOLBAR_BUTTONS.CLEAR }
]
const RenderTestForm = ({
    questions = [],
    addQuestion = () => { },
    removeQuestion = () => { },
    updateQuestion = () => { },
    openPopupConfirmAlert = () => { },
    openPopupTextEditor = () => { },
    scrollToId = () => { }
 }) => {
    const [question, setQuestion] = useState(undefined);
    const [currentQuestion, setCurrentQuestion] = useState(undefined);
    const [expand, setExpand] = useState(undefined)
    const [isOpenForm, setIsOpenForm] = useState(false);
    const editor = useEditor(buildEditorConfig(fastEditorButtons, {
        editable: true,
        content: question?.content || '',
        placeholder: "Soạn thảo nội dung câu hỏi",
        onChange: (newContent) => {
            setQuestion(prev => ({ ...prev, content: newContent }))
        }
    }));
    useEffect(() => {
        return () => {
            setIsOpenForm(false);
            setQuestion(undefined);
            setExpand(undefined);
        }
    }, [])
    useEffect(() => {
        if (!isOpenForm || !question) return;
        scrollToId(`form-question`, {top: 100});
    }, [isOpenForm])
    useEffect(() => {
        setIsOpenForm(false);
        setQuestion(undefined);
        setExpand(undefined);
    }, [questions])
    useEffect(() => {
        if (!editor) return;
        if (editor.getHTML() === question?.content) return;
        editor.commands.setContent(question?.content || '');
    }, [question?.content])
    const handleOpenPopupTextEditor = (content, handleSave) => {
        openPopupTextEditor(content, handleSave, fastEditorButtons)
    }
    const handleChangeType = (e) => {
        const typeId = e.target.value
        let answers = question?.answers
        let answer = question?.answer;
        let instruction = question?.instruction;
        if (isQuestionTypeChoice(typeId)) {
            let hasCorrect = false;
            answers = !hasData(answers) ? [
                newAnswerChoice(),
                newAnswerChoice()
            ] : answers.map(ans => {
                if (typeId === QUESTION_TYPE.CHOICE.id && ans.isCorrect) {
                    if (hasCorrect)
                        ans.isCorrect = false;
                    else
                        hasCorrect = true;
                }
                return ans;
            })
        }
        else if (typeId === QUESTION_TYPE.ARGUMENT.id) {
            answer = !hasData(answer) ? '' : answer
            instruction = hasData(instruction) ? instruction : '';
        }
        setQuestion(prev => ({ ...prev, answers, answer, instruction, type: typeId }))
    }
    const handleAddQuestion = () => {
        const objTrim = structuredClone(trimAll(question));
        const msgError = validateQuestion(objTrim);
        if (msgError) {
            toast.error(msgError)
            return;
        }
        addQuestion(objTrim)
        reset();
    }
    const handleOpenFormEdit = (action, q) => {
        if (action === 'ADD') {
            setQuestion(structuredClone(newQuestion()))
            setCurrentQuestion(structuredClone(newQuestion()))
            setIsOpenForm(true);
        }
    }
    const handleCloseForm = () => {
        const callback = () => {
            reset()
        }
        if ((question?.id && deepEquals(question, questions.find(q => q.id === question?.id))) || !hasData(question))
            callback()
        else
            openPopupConfirmAlert({
                type: 'warning',
                title: 'Xác nhận hủy bỏ',
                label: 'Bạn có chắc hủy thay đổi?',
                onAccept: callback
            })
    }
    const reset = () => {
        setIsOpenForm(false);
        setQuestion(undefined);
    }

    const hasContent = (html) => {
        if (!html) return false;

        const doc = new DOMParser().parseFromString(html, "text/html");

        const text = doc.body.textContent.trim();

        const hasMedia = doc.querySelector("img");

        return text.length > 0 || !!hasMedia;
    };

    const validateQuestion = (question) => {
        if (!isObject(question))
            return "Vui lòng nhập thông tin câu hỏi";

        if (!hasContent(question.content))
            return "Nội dung câu hỏi không được để trống";

        if (question.score <= 0)
            return "Điểm số phải lớn hơn 0";

        if (
            question.type === QUESTION_TYPE.CHOICE.id ||
            question.type === QUESTION_TYPE.MULTI_CHOICE.id
        ) {

            if (!question.answers || question.answers.length < 2)
                return "Vui lòng nhập tối thiểu 2 câu trả lời";

            if (question.answers.some(ans => !hasContent(ans.content)))
                return "Câu trả lời không được để trống";

            const answersCorrect =
                question.answers.filter(ans => ans.isCorrect);

            if (answersCorrect.length === 0)
                return "Vui lòng chọn đáp án đúng";

            const existed = {};
            if (question.answers.some(ans => {
                if (existed[ans.content]) return true;
                existed[ans.content] = true;
                return false;
            }))
                return "Đáp áp không được trùng nhau";

            if (
                question.type === QUESTION_TYPE.CHOICE.id &&
                answersCorrect.length !== 1
            )
                return "Chỉ có duy nhất 1 đáp án đúng";

        } else if (question.type === QUESTION_TYPE.ARGUMENT.id) {

            if (!hasContent(question.answer))
                return "Vui lòng nhập câu trả lời";

        } else {

            return "Vui lòng chọn loại câu hỏi";
        }

        return null;
    };

    const handleUpdateAction = (questionId) => {
        if (questionId === question?.id) return;
        const callback = () => {
            const question = questions.find(q => q.id === questionId);
            if (!question) return;
            setQuestion(structuredClone(question))
            setCurrentQuestion(structuredClone(question))
            if (!isOpenForm)
                setIsOpenForm(true)
            else
                scrollToId(`form-question`, {top: 100});
        }
        if (!isOpenForm || deepEquals(question, questions.find(q => q.id === question?.id)))
            callback();
        else
            openPopupConfirmAlert({
                type: 'warning',
                title: 'Xác nhận hành động',
                label: 'Dữ liệu chưa lưu sẽ bị hủy bỏ, tiếp tục hành động?',
                onAccept: callback
            })
    }
    const handleUpdateQuestion = () => {
        const objTrim = structuredClone(trimAll(question));
        if (!objTrim.id) return;
        const msgError = validateQuestion(objTrim);
        if (msgError) {
            toast.error(msgError)
            return;
        }
        const callback = () => {
            updateQuestion(objTrim)
            reset()
        }
        if (deepEquals(question, questions.find(q => q.id === question?.id)))
            callback();
        else
            openPopupConfirmAlert({
                type: 'warning',
                title: 'Xác nhận cập nhật',
                label: 'Bạn có chắc muốn cập nhật thông tin câu hỏi?',
                onAccept: callback
            })
    }

    const handleRemoveQuestion = (questionId) => {
        if (!questionId) return;
        const callback = () => {
            removeQuestion(questionId)
            if (question?.id === questionId)
                reset();
            if (expand === questionId)
                setExpand(undefined)
        }
        openPopupConfirmAlert({
            type: 'warning',
            title: 'Xác nhận xóa',
            label: 'Bạn có chắc muốn xóa câu hỏi này chứ?',
            onAccept: callback
        })
    }

    return (
        <div className="section-card p-4">
            <div className="section-title section-color-4">
                <FontAwesomeIcon icon={faListCheck} />
                Bài kiểm tra
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span>Danh sách câu hỏi</span>

                    <button
                        type="button"
                        title="Thêm mới câu hỏi"
                        disabled={isOpenForm}
                        onClick={() => handleOpenFormEdit("ADD")}
                        className="hover:opacity-60 disabled:pointer-events-none disabled:opacity-60"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-blue-500" />
                    </button>
                </div>

                {!!questions?.length && <div className="overflow-hidden rounded-xl border border-color-secondary">
                    {questions.map((q, index) => {
                        const isExpand = expand === q.id;
                        const isChoiceQuestion =
                            q.type === QUESTION_TYPE.CHOICE.id ||
                            q.type === QUESTION_TYPE.MULTI_CHOICE.id;

                        return (
                            <div
                                key={q.id || index}
                                className={`${index > 0 ? "border-t" : ""}`}
                            >
                                <div className="flex items-center gap-2 px-3 py-3">
                                    <button
                                        type="button"
                                        title="Mở rộng"
                                        onClick={() =>
                                            setExpand(prev =>
                                                prev === q.id ? undefined : q.id
                                            )
                                        }
                                        className={`text-sm transition-transform duration-200 ${isExpand ? "rotate-180" : ""
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={faChevronDown} />
                                    </button>

                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                        {q.score} điểm
                                    </span>

                                    <span className="flex-1 font-medium">
                                        Câu hỏi {index + 1}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <button onClick={_ => handleUpdateAction(q.id)}
                                            type="button"
                                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
                                        >
                                            <FontAwesomeIcon
                                                icon={faPen}
                                                className="text-blue-500"
                                            />
                                        </button>

                                        <button onClick={_ => handleRemoveQuestion(q.id)}
                                            type="button"
                                            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50"
                                        >
                                            <FontAwesomeIcon
                                                icon={faTrash}
                                                className="text-red-500"
                                            />
                                        </button>
                                    </div>
                                </div>

                                {isExpand && (
                                    <div className="space-y-4 border-t bg-gray-50/40 px-4 py-4">
                                        <div>
                                            <div className="mb-2 text-sm font-semibold text-gray-700">
                                                Câu hỏi
                                            </div>

                                            <div
                                                className="ProseMirrorView rounded-lg bg-white p-3 border"
                                                dangerouslySetInnerHTML={{
                                                    __html: q.content,
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <div className="mb-2 text-sm font-semibold text-gray-700">
                                                Trả lời
                                            </div>

                                            <div className="overflow-hidden rounded-lg border bg-white">
                                                {isChoiceQuestion &&
                                                    q.answers?.map((a, answerIndex) => (
                                                        <div
                                                            key={answerIndex}
                                                            className={`flex items-start gap-3 px-3 py-3 ${answerIndex > 0 ? "border-t" : ""
                                                                }`}
                                                        >
                                                            <span
                                                                className={`mt-0.5 text-sm ${a.isCorrect
                                                                    ? "text-green-600"
                                                                    : "text-transparent"
                                                                    }`}
                                                            >
                                                                &#10003;
                                                            </span>

                                                            <p className="flex-1 break-words text-sm">
                                                                {a.content}
                                                            </p>
                                                        </div>
                                                    ))}

                                                {q.type ===
                                                    QUESTION_TYPE.ARGUMENT.id && (<>
                                                        <div className="p-3 text-sm">
                                                            {q.answer}
                                                        </div>
                                                    </>
                                                    )}
                                            </div>
                                        </div>
                                        {q.type === QUESTION_TYPE.ARGUMENT.id &&
                                            <div className="">
                                                <div className="mb-2 text-sm font-semibold text-gray-700">
                                                    Hướng dẫn trả lời
                                                </div>

                                                <div className="overflow-hidden rounded-lg border bg-white">
                                                    <div className="p-3">
                                                        {q.instruction ? q.instruction : 'Không có hướng dẫn'}
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                        <div className="">
                                            <div className="mb-2 text-sm font-semibold text-gray-700">
                                                Giải thích
                                            </div>

                                            <div className="overflow-hidden rounded-lg border bg-white">
                                                <div className="p-3">
                                                    {q.explain ? q.explain : 'Không có giải thích'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>}
                {!questions?.length && <p className="text-sm text-gray-500">Chưa có câu hỏi nào</p>}
            </div>

            {isOpenForm && (
                <div id={`form-question`} >
                    <div className="section-title section-color-4 mt-4">
                        {question.id ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}
                    </div>

                    <div className="form-grid mt-4 gap-4">
                        <div className="field col-span-full @sm:col-span-1">
                            <label>
                                Loại câu hỏi{" "}
                                <span className="text-red-500">*</span>
                            </label>

                            <select
                                value={question?.type}
                                onChange={handleChangeType}
                            >
                                <option value="">Chọn loại</option>

                                {Object.keys(QUESTION_TYPE).map((key, index) => {
                                    const type = QUESTION_TYPE[key];

                                    return (
                                        <option key={index} value={type.id}>
                                            {type.name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="field col-span-full @sm:col-span-1">
                            <label>
                                Điểm <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="text"
                                min="1"
                                placeholder="Nhập điểm"
                                id="max-score"
                                value={question?.score || ''}
                                onChange={(e) => {
                                    setQuestion(prev => {
                                        return ({ ...prev, score: split0(e.target.value.replace(/[^0-9.]/g, '').replace(/^(\d*\.?\d{0,2}).*$/, '$1') || '0') })
                                    });
                                }}
                                maxLength={16}
                            />
                        </div>

                        <div className="field form-full">
                            <label className="mb-1 flex items-center justify-between">
                                <span>
                                    Nội dung câu hỏi{" "}
                                    <span className="text-red-500">*</span>
                                </span>

                                <button
                                    type="button"
                                    className="hover:opacity-80"
                                    onClick={() =>
                                        handleOpenPopupTextEditor(
                                            question?.content || '',
                                            newContent => {
                                                setQuestion(prev => ({
                                                    ...prev,
                                                    content: newContent,
                                                }));
                                            }
                                        )
                                    }
                                >
                                    <FontAwesomeIcon
                                        icon={faArrowUpRightFromSquare}
                                        className="text-sm text-gray-700"
                                    />
                                </button>
                            </label>

                            <div className="max-h-[60vh] overflow-auto rounded-xl border bg-white text-editor border-color-secondary">
                                <EditorContent
                                    editor={editor}
                                    className="px-3 py-2"
                                    onMouseDown={e => {
                                        if (e.target?.tagName === "IMG") {
                                            e.stopPropagation();
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {!!question?.type && (
                            <>
                                <div className="field form-full">
                                    <label className="mb-1 flex items-center">
                                        <span className="flex w-full">
                                            Câu trả lời&nbsp;<span className="text-red-500">*</span>
                                        </span>

                                        {isQuestionTypeChoice(question?.type) && (
                                            <button
                                                type="button"
                                                title="Thêm câu trả lời"
                                                className="hover:opacity-80"
                                                onClick={() =>
                                                    setQuestion(prev => ({
                                                        ...prev,
                                                        answers: [
                                                            ...(prev.answers || []),
                                                            newAnswerChoice(),
                                                        ],
                                                    }))
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={faPlus}
                                                    className="text-sm text-blue-700"
                                                />
                                            </button>
                                        )}
                                    </label>

                                    <div className="space-y-2">
                                        {isQuestionTypeChoice(question?.type) &&
                                            question?.answers?.map((answer, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2"
                                                >
                                                    <input
                                                        type={
                                                            question?.type ===
                                                                QUESTION_TYPE.CHOICE.id
                                                                ? "radio"
                                                                : "checkbox"
                                                        }
                                                        checked={!!answer.isCorrect}
                                                        name="question-answer"
                                                        title="Là đáp án đúng?"
                                                        value={index}
                                                        onChange={() =>
                                                            setQuestion(prev => {
                                                                if (QUESTION_TYPE.CHOICE.id === question.type)
                                                                    for (let i = 0; i < prev.answers.length; i++) {
                                                                        prev.answers[i].isCorrect = false;
                                                                        if (index === i)
                                                                            prev.answers[index].isCorrect = true;
                                                                    }
                                                                else if (QUESTION_TYPE.MULTI_CHOICE.id === question.type)
                                                                    prev.answers[index].isCorrect = !prev.answers[index].isCorrect

                                                                return { ...prev };
                                                            })
                                                        }
                                                    />

                                                    <input
                                                        type="text"
                                                        required
                                                        value={answer.content || ''}
                                                        placeholder={`Nhập đáp án ${index + 1}`}
                                                        className="flex-1"
                                                        onChange={e =>
                                                            setQuestion(prev => {
                                                                prev.answers[index].content =
                                                                    e.target.value;

                                                                return { ...prev };
                                                            })
                                                        }
                                                    />

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            !(question?.answers?.length > 2)
                                                        }
                                                        onClick={() =>
                                                            setQuestion(prev => ({
                                                                ...prev,
                                                                answers:
                                                                    prev.answers.filter(
                                                                        (_, i) => i !== index
                                                                    ),
                                                            }))
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 disabled:pointer-events-none disabled:opacity-60"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faTrash}
                                                            className="text-red-600"
                                                        />
                                                    </button>
                                                </div>
                                            ))}

                                        {question?.type ===
                                            QUESTION_TYPE.ARGUMENT.id && (
                                                <input
                                                    type="text"
                                                    required
                                                    maxLength={100}
                                                    placeholder="Nhập đáp án"
                                                    value={question?.answer || ''}
                                                    onChange={e =>
                                                        setQuestion(prev => ({
                                                            ...prev,
                                                            answer: e.target.value,
                                                        }))
                                                    }
                                                />
                                            )}
                                    </div>
                                </div>

                                {question?.type ===
                                    QUESTION_TYPE.ARGUMENT.id && (
                                        <div className="field form-full">
                                            <label>Hướng dẫn trả lời</label>

                                            <input
                                                type="text"
                                                maxLength={300}
                                                placeholder="Nhập hướng dẫn trả lời"
                                                value={question?.instruction || ''}
                                                onChange={e =>
                                                    setQuestion(prev => ({
                                                        ...prev,
                                                        instruction: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                    )}

                                <div className="field form-full">
                                    <label>Giải thích</label>
                                    <input
                                        type="text"
                                        maxLength={300}
                                        placeholder="Nhập giải thích"
                                        value={question?.explain || ''}
                                        onChange={e =>
                                            setQuestion(prev => ({
                                                ...prev,
                                                explain: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </>
                        )}

                        <div className="form-full flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={handleCloseForm}
                                className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
                            >
                                <FontAwesomeIcon icon={faClose} /> Đóng
                            </button>

                            <button
                                type="button"
                                onClick={question?.id ? handleUpdateQuestion : handleAddQuestion}
                                className="rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-60 disabled:pointer-events-none"
                                disabled={deepEquals(question, currentQuestion)}
                            >
                                <FontAwesomeIcon icon={question?.id ? faCheck : faPlus} /> {question?.id ? 'Cập nhật' : 'Thêm'}
                            </button>
                        </div>
                    </div>
                </div>)}
        </div>
    );
}

export default RenderTestForm;