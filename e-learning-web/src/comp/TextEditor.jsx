import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import CharacterCount from "@tiptap/extension-character-count";
import './style/LessonEditor.css'
import { buildEditorConfig, excuteIfFunction, isFunction, isString, validatePhoto } from "../helper/utils";
import { toast } from "react-toastify";
import { uploadTempPhoto } from "../service/PhotoService";
import { TEXT_EDITOR_TOOLBAR_BUTTONS } from "../define/define";
import { CustomTextAlign } from "./LessonEditorComp/CustomTextAlign";

const TextEditor = ({
  content = "",
  onChange,
  placeholder = "Bắt đầu soạn thảo nội dung...",
  editable = true,
  pushTempImage,
  openPopupUploadImage,
  groupsBtn
}) => {
  const editor = useEditor(buildEditorConfig(groupsBtn, {editable: true, content, placeholder, onChange}));

  const handleInsertImage = (imageFile) => {
    const error = validatePhoto(imageFile);
    if (isString(error)) {
      toast.error(error)
      return;
    }

    uploadTempPhoto([imageFile])
      .then(response => {
        const photoResponse = response?.data?.data?.[0];
        editor?.chain().focus().setImage({ src: photoResponse.url }).run();
        pushTempImage?.(photoResponse.id)
      }).catch(_ => { })
  }

  const wordCount = editor
    ? editor.storage.characterCount.words()
    : 0;
  const charCount = editor
    ? editor.storage.characterCount.characters()
    : 0;

  const onImageClick = () => {
    openPopupUploadImage?.(handleInsertImage)
  }

  const setLink = () => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Nhập URL:", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
  };

  return (
    <div className="flex flex-col overflow-hidden bg-white shadow-sm min-h-0 w-full">
      {editable && groupsBtn && (
        <div className="flex items-center flex-wrap gap-0.5 px-3 py-2 border-b border-zinc-100 bg-white sticky top-0">
          {groupsBtn.map((option, gi) => {
            return (
              <span key={gi} className="flex items-center gap-0.5">
                {gi > 0 && <span className="w-px h-5 bg-zinc-200 mx-1 flex-shrink-0" />}
                {Object.values(option)?.map(({ icon: Icon, title, action, active, disabled, type, inputProperties, comp }, i) => {
                  return (
                    <button
                      key={i}
                      type="button"
                      title={title}
                      disabled={excuteIfFunction(disabled, editor)}
                      onClick={_ => excuteIfFunction(action, editor, { setLink, onImageClick })}
                      className={`
                        inline-flex items-center justify-center w-8 h-8 rounded-md text-sm
                        transition-all duration-100 select-none
                        ${excuteIfFunction(active, editor)
                          ? "bg-primary-50 text-primary-500 ring-1 ring-primary-500/30"
                          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"}
                        ${excuteIfFunction(disabled, editor) ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      <Icon size={14} />
                    </button>
                  )
                })}
              </span>)
          })
          }
        </div>
      )}

      <div className="tiptap-editor px-4 py-2 overflow-y-auto flex-1">
        <EditorContent editor={editor}
          spellcheck="false"
          onMouseDown={(e) => {
            const target = e.target;

            if (target?.tagName === "IMG") {
              e.stopPropagation();
            }
          }} />
      </div>

      {editable && (
        <div className="flex items-center gap-4 px-4 py-1.5 border-t border-zinc-100 bg-zinc-50 text-xs text-zinc-400">
          <span><span className="font-medium text-zinc-500">{wordCount}</span> từ</span>
          <span><span className="font-medium text-zinc-500">{charCount}</span> ký tự</span>
        </div>
      )}
    </div>
  );
};

export default TextEditor;
