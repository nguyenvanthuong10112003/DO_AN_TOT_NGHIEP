import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useBeforeUnload, useBlocker, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import ConfirmAlert from "../comp/ComfirmAlert";
import { getUserInfo, hasData, hasRole } from "../helper/utils";
import { LOCAL_STORAGE_KEY, USER_ROLE } from "../define/define";
import { usePrompt } from "../include/usePrompt";
import { HasUnsavedChangesStore } from "../store/HasUnsavedChangesStore";

const Layout = () => {
    const [isOpenSideBar, setIsOpenSidebar] = useState(false);
    const [controllers, setControllers] = useState([]);
    const [activeItem, setActiveItem] = useState();
    const [title, setTitle] = useState();
    const [currentUser, setCurrentUser] = useState();
    const navigate = useNavigate();

    const onConfirmAlertCloseDefault = () => {
        setConfirmAlertAttr(prev => ({ ...prev, isOpen: false }))
    };
    const onConfirmAlertAcceptDefault = () => {
        setConfirmAlertAttr(prev => ({ ...prev, isOpen: false }))
    }
    const [confirmAlertAttr, setConfirmAlertAttr] = useState({
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
    const openConfirmAlert = (attr) => {
        setConfirmAlertAttr(prev => ({
            ...prev, ...attr, isOpen: true,
            onAccept: () => {
                onConfirmAlertAcceptDefault();
                if (attr?.onAccept instanceof Function)
                    attr?.onAccept();
            },
            onClose: () => {
                onConfirmAlertCloseDefault();
                if (attr?.onClose instanceof Function)
                    attr?.onClose();
            }
        }))
    }
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
        setCurrentUser(getUserInfo())
    }, []);
    useEffect(() => {
        document.title = title || (hasRole(USER_ROLE.ADMIN) ? process.env.REACT_APP_MANAGEMENT_NAME : process.env.REACT_APP_NAME);
    }, [title]);
    const toggleSideBar = () => {
        setIsOpenSidebar(prev => !prev);
    }
    return <>
        <div className="">
            <Header currentUser={currentUser} toggleSideBar={toggleSideBar} />
            <Sidebar currentUser={currentUser} isOpenSideBar={isOpenSideBar} />
            <div className={`min-h-screen pt-16 bg-gray-50 w-full ${isOpenSideBar ? 'sm:pl-[20rem]' : ''} transition-all duration-500 ease-in-out flex flex-col justify-between`}>
                <div className="p-2 flex-1 pb-6">
                    {controllers && controllers instanceof Array && controllers.length > 0 && <div className="flex flex-row">
                        {controllers.map((controller, index) => {
                            return <li key={index} className="list-none text-md">
                                {index !== 0 && <span className="mx-2 text-gray-500">{'>'}</span>}
                                <Link to={controller.url || '#'}
                                    className={`no-underline text-md text-gray-500 cursor-default ${controller.url && 'hover:text-blue-600 hover:underline cursor-pointer'}`}>
                                    {controller.name}
                                </Link>
                            </li>
                        })}
                    </div>}
                    <div>
                        <Outlet context={{ setControllers, setTitle, openConfirmAlert, setCurrentUser }} />
                    </div>
                </div>
                <Footer currentUser={currentUser} />
            </div>
        </div>
        <ConfirmAlert attr={confirmAlertAttr} />
    </>
}

export default Layout;