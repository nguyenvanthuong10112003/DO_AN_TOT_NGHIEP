import { useState } from "react";
import { login } from "../../../service/AuthService";
import { handlerLoginSuccess } from "../../../helper/utils";
import { PAGE_LOCATION } from "../../../define/define";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginAdmin = () => {
    const [errors, setErrors] = useState({});
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    document.title = 'Đăng nhập';
    const validate = () => {
        let errors = {};
        
        if (!username) errors.username = 'Tên đăng nhập là bắt buộc';
        else if (username.toUpperCase().split('').some(char => !((char >= '0' && char <= '9') || (char >= 'A' && char <= 'Z')))) errors.username = 'Tên đăng nhập không được chứa ký tự đặc biệt';
        else if (username.length < 3 || username.length > 30) errors.username = 'Tên đăng nhập phải từ 3 đến 30 ký tự';
        
        if (!password) errors.password = 'Mật khẩu là bắt buộc';
        else if (password.length < 5 || password.length > 100) errors.password = 'Mật khẩu phải từ 5 đến 100 ký tự';
        
        return errors;
    }
    const handlerSubmit = () => {  
        const errors = validate();
        setErrors(errors);
        if (Object.keys(errors).length > 0) return;
        login({username, password, withRoleAdmin: true})
            .then(res => {
                const { accessToken, userInfo } = res?.data?.data;
                handlerLoginSuccess(accessToken, userInfo);
                navigate(PAGE_LOCATION.ADMIN);
                toast.success('Đăng nhập thành công');
            }).catch(_ => {})
    }

    return <>
        <div className="min-h-screen flex items-center justify-center w-full dark:bg-gray-950">
            <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-8 max-w-md border border-gray-100">
                <div className="flex flex-row justify-center">
                    <img src="/logo128.png" alt="brand" />
                </div>
                <h1 className="text-2xl font-bold text-center mb-4 dark:text-gray-200">Chào mừng trở lại <br></br>Quản lý hệ thống học tập!</h1>
                <form onSubmit={(e) => { e.preventDefault(); handlerSubmit(); }} className="min-w-[300px]" autoComplete="off">
                    <div className="">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên đăng nhập</label>
                        <input value={username} onChange={(e) => {setUsername(e.target.value); if (!!errors.username) setErrors({...errors, username: ''})}} type="text" id="username" className="shadow-sm rounded-md w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Nhập tên đăng nhập" required />
                        <span className="text-red-600 font-normal text-sm">{errors.username || <>&nbsp;</>}</span>
                    </div>
                    <div className="">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mật khẩu</label>
                        <input value={password} onChange={(e) => {setPassword(e.target.value); if (!!errors.password) setErrors({...errors, password: ''})}} type="password" id="password" className="shadow-sm rounded-md w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Nhập mật khẩu" required />
                        <span className="text-red-600 font-normal text-sm">{errors.password || <>&nbsp;</>}</span>
                    </div>
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-semibold">Đăng nhập</button>
                </form>
            </div>
        </div >
    </>
}

export default LoginAdmin;