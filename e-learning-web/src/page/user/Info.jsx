import React, { use, useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { getMindInfo, linkGoogleAccount, updateInfo } from "../../service/UserService";
import { faArrowRotateLeft, faCheck, faClose, faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import { betweenDateByYear, createMessage, displayDate, getDisplayRole, getToken, getUrlGoogleLogin, handlerLoginSuccess, hasData, isEmailValid, isFunction, isObject, isString, validatePhoto } from "../../helper/utils";
import Field from "../../comp/Field";
import { LOCAL_STORAGE_KEY, PAGE_LOCATION, RATIOS } from "../../define/define";

const UserInfo = () => {
    const imageRef = useRef();
    const { setControllers, setTitle, openPopupConfirmAlert, setCurrentUser, openPopupResizeImage, handleReset } = useOutletContext();
    const [editField, setEditField] = useState(null);
    const [tempValue, setTempValue] = useState("");
    const [user, setUser] = useState({});
    const [constUser, setConstUser] = useState({});
    const [avatarFile, setAvatarFile] = useState(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const params = Object.fromEntries(searchParams.entries());
    const fields = {
        username: {
            label: 'Tên đăng nhập', fieldName: 'username', type: 'text', canEdit: true, isRequired: true, minLength: 3, maxLength: 30,
            validate: (value) => {
                if (value.toUpperCase().split('').some(char => !((char >= '0' && char <= '9') || (char >= 'A' && char <= 'Z')))) {
                    toast.error('Tên đăng nhập không được chứa ký tự đặc biệt!');
                    return false;
                }
                return true;
            }
        },
        fullName: { label: 'Họ và tên', fieldName: 'fullName', type: 'text', canEdit: true, isRequired: true, minLength: 1, maxLength: 100 },
        gender: {
            label: 'Giới tính', fieldName: 'gender', type: 'radio-button', canEdit: true, isRequired: true,
            options: [{ label: 'Nam', value: '1' }, { label: 'Nữ', value: '0' }],
            displayValue: (value) => {
                if (value === '1') return 'Nam';
                if (value === '0') return 'Nữ';
                return '';
            }
        },
        dob: {
            label: 'Ngày sinh', fieldName: 'dob', type: 'date', canEdit: true, isRequired: true,
            displayValue: (value) => !hasData(value) ? '' : displayDate(value) + ' (' + betweenDateByYear(value, new Date()) + ' tuổi)',
            validate: (value) => {
                const today = new Date();
                const birthDate = new Date(value);
                if (birthDate >= today) {
                    toast.error('Ngày sinh phải trước ngày hôm nay!');
                    return false;
                }
                if (betweenDateByYear(birthDate, today) < 12) {
                    toast.error('Người dùng phải từ 12 tuổi trở lên');
                    return false;
                }
                return true;
            }
        },
        email: { label: 'Email', fieldName: 'email', type: 'email', isRequired: true },
        password: {
            label: 'Mật khẩu', fieldName: 'password', canEdit: true,
            displayValue: () => '*****'
        },
        role: {
            label: 'Vai trò', fieldName: 'roles',
            displayValue: (roles) => roles && roles.map(role => getDisplayRole(role)).join(', ')
        }
    };

    useEffect(() => {
        if (isFunction(setTitle)) setTitle('Thông tin cá nhân');
        if (isFunction(setControllers)) setControllers([{ name: 'Người dùng' }, { name: 'Thông tin cá nhân' }]);
        const init = async () => {
            if (!params?.error && params?.code) {
                await linkGoogleAccount({ ...params, redirect_uri: process.env.REACT_APP_GOOGLE_LINK_REDIRECT_URI })
                    .then(response => {
                        localStorage.setItem(LOCAL_STORAGE_KEY.USER_EMAIL, response?.data?.data)
                        toast.success('Liên kết tài khoản thành công');
                    })
                    .catch(_ => { });
                navigate(window.location.pathname, { replace: true });
            }
            getMindInfo()
                .then(res => {
                    const userInfo = res?.data?.data;
                    if (hasData(userInfo.gender))
                        userInfo.gender = userInfo.gender == true ? '1' : '0';
                    setUser(userInfo);
                    setConstUser(userInfo);
                })
                .catch(_ => { });
        }
        init();
        return () => {
            handleReset?.();
        };
    }, []);

    const handleEditField = (field) => {
        if (field === fields.password.fieldName) {
            navigate(PAGE_LOCATION.USER_CHANGE_PW)
            return;
        }
        setEditField(field);
        setTempValue(user[field]);
    };

    const handleSaveField = () => {
        if (!validate(editField, tempValue)) return;
        setUser({ ...user, [editField]: tempValue });
        setEditField(null);
    };

    const validate = (field, value) => {
        const keys = Object.keys(fields);
        if (!keys.includes(field)) return true;
        const fieldInfo = fields[field];
        if (!hasData(fieldInfo) || isObject(fieldInfo)) return true;
        if (fieldInfo.isRequired && (value || '').trim().length === 0) {
            toast.error(`${fieldInfo.label} bắt buộc nhập!`);
            return false;
        }
        if (fieldInfo.type === 'text') {
            if (fieldInfo.minLength && value.length < fieldInfo.minLength) {
                toast.error(`${fieldInfo.label} phải có ít nhất ${fieldInfo.minLength} ký tự!`);
                return false;
            }
            if (fieldInfo.maxLength && value.length > fieldInfo.maxLength) {
                toast.error(`${fieldInfo.label} không được vượt quá ${fieldInfo.maxLength} ký tự!`);
                return false;
            }
        }
        else if (fieldInfo.type === 'email') {
            if (!isEmailValid(value)) {
                toast.error(`${fieldInfo.label} không đúng định dạng!`);
                return false;
            }
        }
        if (isFunction(fieldInfo.validate)) {
            return fieldInfo.validate(value);
        }
        return true;
    }

    const handleCancelField = () => {
        setEditField(null);
    };

    const handleClickOpenExplorer = () => {
        imageRef.current.click();
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        if (selectedFiles.length > 1) {
            toast.error(`Tải lên tối đa 1 file!`);
            return;
        }

        const file = selectedFiles[0];
        const message = validatePhoto(file);
        if (isString(message)) {
            toast.error(message)
            return;
        }

        openPopupResizeImage([RATIOS.AVATAR], file, true, (newFile) => {
            setAvatarFile(newFile);
            const previewUrl = URL.createObjectURL(newFile);
            setUser(prev => ({ ...prev, avatar: previewUrl }))
        })
    };

    const handlerReset = () => {
        const callBack = () => {
            setAvatarFile(null);
            setUser(structuredClone(constUser));
            setEditField(null);
            setTempValue(null);
        }
        if (hasChange())
            openPopupConfirmAlert({
                type: 'warning',
                title: 'Xác nhận làm mới',
                label: 'Bạn có chắc muốn hủy thay đổi?',
                onAccept: callBack
            })
        else callBack()
    }

    const hasChange = () => {
        const has = hasData(avatarFile) || Object.keys(fields).some(key => {
            const field = fields[key];
            return user[field.fieldName] !== constUser[field.fieldName];
        });
        return has;
    }

    const handlerSave = () => {
        const errorMsg = Object.keys(fields).filter(key => {
            const field = fields[key];
            return !((!field.isRequired || hasData(user[field.fieldName])) && (!isFunction(field.validate) || field.validate(user[field.fieldName])));
        }).map(key => fields[key].label + ' không hợp lệ')
            .join('; ');
        if (hasData(errorMsg)) {
            toast.error(errorMsg);
            return;
        }
        openPopupConfirmAlert({
            type: 'warning',
            title: 'Xác nhận cập nhật',
            label: 'Bạn có chắc muốn lưu thay đổi?',
            onAccept: () => {
                updateInfo({ username: user.username, fullName: user.fullName, gender: user.gender === '1', dob: user.dob, avatarFile: avatarFile })
                    .then(res => {
                        const userInfo = res?.data?.data;
                        handlerLoginSuccess(getToken(), userInfo);
                        setCurrentUser({ ...userInfo });
                        if (hasData(userInfo.gender))
                            userInfo.gender = userInfo.gender === true ? '1' : '0'
                        setUser(userInfo);
                        setConstUser(userInfo);
                        toast.success('Cập nhật thành công!');
                    })
                    .catch(_ => { })
            }
        })
    }

    const handleRemoveAvatarFile = () => {
        if (!avatarFile) return;
        openPopupConfirmAlert({
            type: 'warning',
            title: 'Xác nhận xóa',
            label: 'Bạn có chắc muốn xóa ảnh này?',
            onAccept: () => {
                setAvatarFile(null)
                setUser(prev => ({...prev, avatar: constUser.avatar}))
            }
        })
    }

    return Object.keys(user || {}).length > 0 && (
        <div className="mt-2 flex items-center justify-center w-full mb-2">
            <div className="w-full max-w-3xl bg-white rounded-2xl border">
                <div className="w-full text-end p-2 rounded-t-2xl flex flex-row items-center justify-end gap-4">
                    <button type="button" disabled={!hasChange()} className="disabled:pointer-events-none disabled:opacity-60" title="Đặt lại" onClick={handlerReset}>
                        <FontAwesomeIcon icon={faArrowRotateLeft} className="text-gray-500 w-6 h-6 hover:text-gray-600" />
                    </button>
                    <button onClick={handlerSave} disabled={!hasChange()} type="button" className="py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition disabled:opacity-40 disabled:hover:bg-blue-500">
                        <FontAwesomeIcon icon={faCheck} />
                        <span className="ms-2">Cập nhật</span>
                    </button>
                </div>
                <hr></hr>
                <div className="p-6 space-y-5">
                    <div className="flex flex-col items-center gap-3 mt-10">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden shadow shadow-gray-500">
                                <img
                                    src={user.avatar || '/img/user.png'}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                />
                                <input type="file" ref={imageRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>

                            <button
                                onClick={(avatarFile && user.avatar) ? handleRemoveAvatarFile : handleClickOpenExplorer}
                                type="button"
                                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white border border-gray-300 shadow flex items-center justify-center hover:bg-gray-100 transition"
                            >
                                {avatarFile && user.avatar && <FontAwesomeIcon icon={faClose} className="w-3.5 h-3.5 text-red-700" />}
                                {!(avatarFile && user.avatar) && <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5 text-gray-700" />}
                            </button>
                        </div>

                        <h2 className="text-lg font-semibold text-gray-800">
                            Thông tin cá nhân
                        </h2>
                    </div>
                    <Field target={user} field={fields.username} editField={editField} tempValue={tempValue} setTempValue={setTempValue} handleSave={handleSaveField} handleCancel={handleCancelField} handleEdit={handleEditField} />
                    <Field target={user} field={fields.fullName} editField={editField} tempValue={tempValue} setTempValue={setTempValue} handleSave={handleSaveField} handleCancel={handleCancelField} handleEdit={handleEditField} />
                    <Field target={user} field={fields.gender} editField={editField} tempValue={tempValue} setTempValue={setTempValue} handleSave={handleSaveField} handleCancel={handleCancelField} handleEdit={handleEditField} />
                    <Field target={user} field={fields.dob} editField={editField} tempValue={tempValue} setTempValue={setTempValue} handleSave={handleSaveField} handleCancel={handleCancelField} handleEdit={handleEditField} />
                    {hasData(user?.email) && <Field target={user} field={fields.email} />}
                    {!hasData(user?.email) && <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-400">Email</span>

                        <div className="flex items-center justify-between gap-2">
                            <button onClick={() => document.location = getUrlGoogleLogin(process.env.REACT_APP_GOOGLE_LINK_REDIRECT_URI)} className="px-4 py-2 border gap-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150 flex items-center justify-center">
                                <img className="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo" />
                                <span className="font-semibold">Liên kết tài khoản Google</span>
                            </button>
                        </div>
                    </div>
                    }
                    <Field target={user} field={fields.password} handleEdit={handleEditField} />
                    <Field target={user} field={fields.role} />
                </div>
            </div>
        </div>
    );
}

export default UserInfo;