import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useBeforeUnload, useBlocker, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import PopupConfirmAlert from "../comp/PopupComfirmAlert";
import { getUserInfo, hasData, hasRole, isArray, isFunction } from "../helper/utils";
import { LOCAL_STORAGE_KEY, USER_ROLE } from "../define/define";
import { usePrompt } from "../include/usePrompt";
import { hasUnsavedChangesStore, HasUnsavedChangesStore } from "../store/HasUnsavedChangesStore";
import PopupResizeImage from "../comp/PopupResizeImage";
import PopupImageViewer from "../comp/PopupImageViewer";
import PopupUploadImage from "../comp/PopupUploadImage";
import PopupTextEditor from "../comp/PopupTextEditor";

const Layout = () => {
    const navigate = useNavigate();
    const [isOpenSideBar, setIsOpenSidebar] = useState(false);
    const [controllers, setControllers] = useState([]);
    const [activeItem, setActiveItem] = useState();
    const [title, setTitle] = useState();
    const [currentUser, setCurrentUser] = useState();
    const [isMainFull, setIsMainFull] = useState(false);
    const [bgColor, setBgColor] = useState('bg-gray-50');

    const [popupResizeImageFile, setPopupResizeImageFile] = useState(undefined);
    const [popupResizeImageHandleSave, setPopupResizeImageHandleSave] = useState(() => { })
    const [popupResizeImageRatios, setPopupResizeImageRatios] = useState(undefined);

    const [popupImageViewerUrl, setPopupImageViewerUrl] = useState(null);
    
    const [popupUploadImageIsOpen, setPopupUploadImageIsOpen] = useState(false);
    const [popupUploadImageHandleUpload, setPopupUploadImageHandleUpload] = useState(() => { })

    const [popupTextEditorIsOpen, setPopupTextEditorIsOpen] = useState(false);
    const [popupTextEditorContent, setPopupTextEditorContent] = useState('');
    const [popupTextEditorGroupsButton, setPopupTextEditorGroupsButton] = useState([]);
    const [popupTextEditorHandleSave, setPopupTextEditorHandleSave] = useState(() => {});

    useEffect(() => {
        const urlBefore = sessionStorage.getItem(LOCAL_STORAGE_KEY.BEFORE_URL);
        if (hasData(urlBefore)) {
            sessionStorage.removeItem(LOCAL_STORAGE_KEY.BEFORE_URL);
            navigate(urlBefore);
            return;
        }
        if (window.innerWidth >= 640)
            setIsOpenSidebar(true);
        const pathNameSplit = document.location.pathname.split('/');
        setActiveItem(pathNameSplit[1].trim().length === 0 ? 'home' : pathNameSplit[1]);
        setCurrentUser(getUserInfo());

        const handleClick = (e) => {
            const target = e.target;
            if (target.tagName === 'IMG') {
                if (target.closest('.ProseMirror')) return;
                setPopupImageViewerUrl(target.src);
            }
        };
        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);
    useEffect(() => {
        document.title = title || (hasRole(USER_ROLE.ADMIN) ? process.env.REACT_APP_MANAGEMENT_NAME : process.env.REACT_APP_NAME);
    }, [title]);

    const onConfirmAlertCloseDefault = () => {
        setConfirmAlertAttr(prev => ({ ...prev, isOpen: false }))
    };
    const onConfirmAlertAcceptDefault = () => {
        setConfirmAlertAttr(prev => ({ ...prev, isOpen: false }))
    }
    const [popupConfirmAlertAttr, setConfirmAlertAttr] = useState({
        isOpen: false,
        iconUse: true,
        type: 'success',
        title: 'Thông báo',
        label: 'Thông báo',
        onClose: onConfirmAlertCloseDefault,
        onAcceptDefault: onConfirmAlertAcceptDefault,
        inputUse: false,
        inputType: 'text',
        inputOnChange: () => { },
        inputRequired: false
    })
    const openPopupResizeImage = (ratios, imageFile, handleSave) => {
        setPopupResizeImageFile(imageFile);
        setPopupResizeImageRatios(ratios)
        setPopupResizeImageHandleSave(prev => handleSave)
    }
    const openPopupUploadImage = (handleUpload) => {
        setPopupUploadImageIsOpen(true);
        setPopupUploadImageHandleUpload((prev) => handleUpload);
    }
    const openPopupTextEditor = (content, onChange, groupsButton) => {
        setPopupTextEditorIsOpen(true);
        setPopupTextEditorGroupsButton(groupsButton)
        setPopupTextEditorContent(content)
        setPopupTextEditorHandleSave((prev) => onChange)
    }
    const onClosePopupResizeImage = () => {
        setPopupResizeImageFile(undefined);
        setPopupResizeImageHandleSave(() => { })
        setPopupResizeImageRatios(undefined)
        setPopupTextEditorContent('')
    }
    const onClosePopupUploadImage = () => {
        setPopupUploadImageIsOpen(false);
        setPopupUploadImageHandleUpload(() => {})
    }
    const onClosePopupTextEditor = () => {
        setPopupTextEditorIsOpen(false);
        setPopupTextEditorGroupsButton([])
        setPopupTextEditorContent('')
        setPopupTextEditorHandleSave(prev => () => {})
    }
    const openPopupConfirmAlert = (attr) => {
        setConfirmAlertAttr(prev => ({
            ...prev, ...attr, isOpen: true,
            onAccept: () => {
                onConfirmAlertAcceptDefault();
                if (isFunction(attr?.onAccept))
                    attr?.onAccept();
            },
            onClose: () => {
                onConfirmAlertCloseDefault();
                if (isFunction(attr?.onClose))
                    attr?.onClose();
            }
        }))
    }
    const onClosePopupImageViewer = () => {
        setPopupImageViewerUrl(null);
    };
    const toggleSideBar = () => {
        setIsOpenSidebar(prev => !prev);
    }
    const handleReset = () => {
        setIsMainFull(false);
        setControllers([]);
        setTitle('');
        hasUnsavedChangesStore.set(false);
    }
    return <>
        <div className="">
            <Header currentUser={currentUser} toggleSideBar={toggleSideBar} />
            <Sidebar currentUser={currentUser} isOpenSideBar={isOpenSideBar} />
            <div className={`min-h-screen pt-16 ${bgColor || 'bg-gray-50'} w-full ${isOpenSideBar ? 'md:pl-[20rem]' : ''} transition-all duration-500 ease-in-out flex flex-col justify-between`}>
                <div className={`flex-1 ${isMainFull !== true && `p-2 ${controllers && isArray(controllers) && controllers.length > 0 && 'pb-6'}`}`}>
                    {controllers && isArray(controllers) && controllers.length > 0 && <div className={`flex flex-row ${isMainFull && 'p-2'}`}>
                        {controllers.map((controller, index) => {
                            return <li key={index} className="list-none text-sm">
                                {index !== 0 && <span className="mx-2 text-gray-500">{'>'}</span>}
                                <Link to={controller.url || '#'}
                                    className={`no-underline text-md text-gray-500 cursor-default ${controller.url && 'hover:text-blue-600 hover:underline cursor-pointer'}`}>
                                    {controller.name}
                                </Link>
                            </li>
                        })}
                    </div>}
                    <div>
                        <Outlet context={{ setControllers, setTitle, openPopupConfirmAlert, setCurrentUser, setIsMainFull, handleReset, setBgColor, openPopupResizeImage, openPopupUploadImage, openPopupTextEditor }} />
                    </div>
                </div>
                <Footer currentUser={currentUser} />
            </div>
        </div>
        <PopupConfirmAlert attr={popupConfirmAlertAttr} />
        <PopupUploadImage open={popupUploadImageIsOpen} onClose={onClosePopupUploadImage} onInsert={popupUploadImageHandleUpload} openPopupConfirmAlert={openPopupConfirmAlert} openPopupResizeImage={openPopupResizeImage} />
        <PopupResizeImage imageFile={popupResizeImageFile} setImageFile={popupResizeImageHandleSave} onClose={onClosePopupResizeImage} ratios={popupResizeImageRatios} openPopupConfirmAlert={openPopupConfirmAlert} />
        <PopupImageViewer imageUrl={popupImageViewerUrl} onClose={onClosePopupImageViewer} />
        <PopupTextEditor defaultContent={popupTextEditorContent} open={popupTextEditorIsOpen} openPopupUploadImage={openPopupUploadImage} groupsButton={popupTextEditorGroupsButton} handleSave={popupTextEditorHandleSave} onClose={onClosePopupTextEditor} openPopupConfirmAlert={openPopupConfirmAlert} />
    </>
}

export default Layout;