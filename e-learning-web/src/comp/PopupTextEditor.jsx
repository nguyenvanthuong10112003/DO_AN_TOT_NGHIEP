import { faClose, faFeatherPointed } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TextEditor from "./TextEditor";
import { useEffect, useState } from "react";

const PopupTextEditor = ({ open, onClose, openPopupUploadImage, defaultContent, groupsButton, handleSave, openPopupConfirmAlert }) => {

    const [content, setContent] = useState('')

    useEffect(() => {
        setContent(defaultContent)
    }, [defaultContent])

    const reset = () => {
        setContent('')
    }

    const handleClose = () => {
        const callBack = () => {
            reset();
            onClose?.()
        }
        if ((defaultContent || '') === (content || ''))
            callBack()
        else 
            openPopupConfirmAlert({ type: 'warning', title: 'Xác nhận hủy', label: 'Bạn có chắc muốn hủy thay đổi?', onAccept: callBack })
    }

    const handleSaveContent = () => {
        handleSave?.(content);
        reset();
        onClose?.()
    }

    return open && <div className="fixed inset-0 z-[21] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={handleClose}>
        <div
            className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl h-full max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-stretch justify-between px-5 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gray-200 flex items-center justify-center">
                        <FontAwesomeIcon icon={faFeatherPointed} className="text-xs" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold">Soạn thảo nội dung</h2>
                    </div>
                </div>

                <div className="flex flex-row gap-2.5 items-stretch">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="w-8 h-8 border rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
                    >
                        <FontAwesomeIcon icon={faClose} className="text-sm" />
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveContent}
                        className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-500 flex items-center justify-center text-white transition"
                    >
                        ✓
                    </button>
                </div>
            </div>

            <div className={`flex flex-1 max-h-full max-w-full flex-col md:flex-row min-h-0`}>
                <TextEditor openPopupUploadImage={openPopupUploadImage} content={defaultContent || content} groupsBtn={groupsButton} onChange={setContent} />
            </div>
        </div>
    </div>
}

export default PopupTextEditor;