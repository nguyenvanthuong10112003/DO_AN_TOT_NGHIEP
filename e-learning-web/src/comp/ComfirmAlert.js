import { faCircleCheck, faCircleExclamation, faCircleInfo, faCircleXmark, faClose } from "@fortawesome/free-solid-svg-icons";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons/faTriangleExclamation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";


const ConfirmAlert = ({ attr }) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState();
    const handlerAccept = () => {
        setError(undefined);
        if (attr?.inputUse && attr?.inputRequired && !value?.trim()) {
            setError('invalid');
            return;
        }
        if (attr?.onClose instanceof Function)
            attr?.onClose();
        if (attr?.onAccept instanceof Function)
            attr?.onAccept();
    }
    const handlerCancel = () => {
        if (attr?.onClose instanceof Function)
            attr?.onClose();
    }
    const handlerInputChange = (e) => {
        if (attr?.inputOnChange instanceof Function)
            attr?.inputOnChange(e);
        setValue(e.target.value)
    }
    const getIcon = (type) => {
        switch (type) {
            case 'warning': return faCircleExclamation
            case 'error': return faCircleExclamation
            case 'info': return faCircleInfo
            case 'success': return faCircleCheck
        }
    }
    const getIconColor = (type) => {
        switch (type) {
            case 'warning': return 'text-yellow-500'
            case 'error': return 'text-red-500'
            case 'info': return 'text-blue-700'
            case 'success': return 'text-green-500'
        }
    }
    return attr.isOpen && <div>
        <div id="dialog" aria-labelledby="dialog-title" className="fixed inset-0 size-auto bg-black/10 z-30">
            <div className="flex h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all border">
                    <div className="p-4 py-2 border-b flex flex-row justify-between items-center">
                        <h3 id="dialog-title" className="text-base font-semibold text-gray-700 text-wrap">{attr?.title}</h3>
                        <FontAwesomeIcon onClick={handlerCancel} icon={faCircleXmark} className="text-red-500 hover:text-red-600 cursor-pointer w-5 h-5 ms-2" />
                    </div>
                    <div className="bg-white p-4">
                        <div className="flex items-start">
                            {attr?.iconUse && <div className="me-4 flex shrink-0 items-center justify-center rounded-full mx-0 size-10">
                                <FontAwesomeIcon icon={getIcon(attr?.type)} className={`w-10 h-10 ${getIconColor(attr?.type)}`} />
                            </div>}
                            <div className="mt-0 text-left">
                                <div className="mt-2">
                                    <p className="text-gray-700 font-sans">{attr?.label}</p>
                                    {attr?.inputUse && <input value={value}
                                        className={`w-full mt-1 border rounded-lg p-2 px-4 ${error ? "!border-red-500" : ""} shadow-sm shadow-gray-50 focus:border-purple-500 border-1 focus:outline-none focus:shadow-purple-300`}
                                        type={attr?.inputType}
                                        onChange={handlerInputChange} />}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 flex flex-row-reverse">
                        <button onClick={handlerAccept} type="button" className="inline-flex justify-center rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600 ml-3 w-auto">Đồng ý</button>
                        <button onClick={handlerCancel} type="button" className="inline-flex justify-center rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-gray-600 mt-0 w-auto">Hủy bỏ</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

export default ConfirmAlert;