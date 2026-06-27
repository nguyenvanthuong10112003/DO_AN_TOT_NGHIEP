import { useState, useRef } from "react";
import { X, Upload, Image } from "lucide-react";
import { PHOTO_ALLOWED_TYPE, PHOTO_MAXIMUM_SIZE_MB, RATIOS } from "../define/define";
import { isFunction, isString, validatePhoto } from "../helper/utils";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCropSimple } from "@fortawesome/free-solid-svg-icons";

const PopupUploadImage = ({ open, onClose, onInsert, openPopupConfirmAlert, openPopupResizeImage }) => {
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    const message = validatePhoto(file);
    if (isString(message)) {
      toast.error(message)
      return
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleInsert = async () => {
    if (!preview) return;
    try {
      await onInsert?.(fileRef.current.files[0]);
      reset();
      onClose?.();
    } catch (e) {}
  };

  const reset = () => {
    setPreview(null);
    fileRef.current = null;
  };

  const handleClose = () => {
    const callBack = () => {
      reset();
      onClose?.();
    }
    if (preview && isFunction(openPopupConfirmAlert))
      openPopupConfirmAlert({ type: 'warning', title: 'Xác nhận hủy', label: 'Bạn có chắc muốn hủy thay đổi?', onAccept: callBack })
    else
      callBack()
  }

  const openPopupResize = () => {
    openPopupResizeImage?.(Object.values(RATIOS).slice(0, -1), fileRef.current.files[0], false, (newFile) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(newFile);
      fileRef.current.files = dataTransfer.files;
    })
  }

  return open && (
    <div className="fixed inset-0 z-[22] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[420px] p-6 animate-in fade-in slide-in-from-bottom-2" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-zinc-800 flex items-center gap-2">
            <Image size={16} className="text-gray-500" />
            Chèn hình ảnh
          </h3>
          <button onClick={handleClose} className="p-1 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all
              ${dragging ? "border-gray-500 bg-gray-50" : "border-zinc-200 hover:border-gray-400 hover:bg-gray-50/50"}`}
        >
          <Upload size={20} className={dragging ? "text-gray-500" : "text-zinc-400"} />
          <p className="text-sm text-zinc-500">
            Kéo thả hoặc <span className="text-gray-500 font-medium">chọn ảnh</span>
          </p>
          <p className="text-xs text-zinc-400">{PHOTO_ALLOWED_TYPE.join(', ')} — tối đa {PHOTO_MAXIMUM_SIZE_MB}MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {preview && (
          <img src={preview} alt="preview" className="mt-3 w-full max-h-40 object-contain rounded-lg border border-zinc-200" />
        )}

        <div className="flex justify-between mt-5">
          <button
            onClick={openPopupResize}
            type="button"
            className="
              w-[38px]
              rounded-lg
              border border-zinc-200
              bg-white
              text-zinc-600
              shadow-sm
              transition-all duration-200
              hover:bg-zinc-100
              hover:border-zinc-300
              hover:text-zinc-900
              disabled:opacity-60
              disabled:pointer-events-none
            "
            title="Cắt ảnh"
            disabled={!preview || !openPopupResizeImage}
          >
            <FontAwesomeIcon
              icon={faCropSimple}
              className="
                text-sm
                transition-transform duration-200
                group-hover:scale-110
              "
            />
          </button>
          <div className="space-x-2">
            <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition">
              Huỷ
            </button>
            <button
              onClick={handleInsert}
              disabled={!preview}
              className="px-4 py-2 border text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Chèn ảnh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupUploadImage;
