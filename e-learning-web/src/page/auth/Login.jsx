import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PAGE_LOCATION } from "../../define/define";
import { createMessage, getUrlGoogleLogin, handlerLoginSuccess, isEmailValid } from "../../helper/utils";
import { login, loginWithGoogle } from "../../service/AuthService";
import { useEffect, useState } from "react";
import emailRegex from "email-regex";
import { toast } from "react-toastify";

const Login = () => {
    document.title = 'Đăng nhập';
    const [errors, setErrors] = useState({});
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const params = Object.fromEntries(searchParams.entries());
    useEffect(() => {
        if (params?.error) return;
        if (!params?.code) return;
        loginWithGoogle({...params, redirect_uri: process.env.REACT_APP_GOOGLE_LOGIN_REDIRECT_URI})
            .then(res => {
                const { accessToken, userInfo } = res?.data?.data;
                handlerLoginSuccess(accessToken, userInfo);
                navigate(PAGE_LOCATION.HOME);
                toast.success('Đăng nhập thành công');
            })
            .catch(_ => {});
        navigate(window.location.pathname, { replace: true });
    }, []);
    const validate = () => {
        let errors = {};
        
        if (!username) errors.username = 'Tên đăng nhập hoặc email là bắt buộc';
        else if (!isEmailValid(username) && (username.length < 3 || username.length > 30 || username.toUpperCase().split('').some(char => !((char >= '0' && char <= '9') || (char >= 'A' && char <= 'Z')))))
            errors.username = 'Tên đăng nhập chỉ chứa các ký tự [a-zA-Z0-9] và độ dài 3 đến 30 ký tự, hoặc email phải đúng định dạng';
        
        if (!password) errors.password = 'Mật khẩu là bắt buộc';
        else if (password.length < 5 || password.length > 100) errors.password = 'Mật khẩu chỉ từ 5 đến 100 ký tự';
        
        return errors;
    }
    const handlerSubmit = () => {
        const errors = validate();
        setErrors(errors);
        if (Object.keys(errors).length > 0) return;
        login({username, password})
            .then(res => {
                const { accessToken, userInfo } = res?.data?.data;
                handlerLoginSuccess(accessToken, userInfo);
                navigate(PAGE_LOCATION.HOME);
                toast.success('Đăng nhập thành công');          
            }).catch(_ => {})
    }
    return (
        <>
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        alt="Your Company"
                        src="/logo128.png"
                        className="mx-auto w-auto"
                    />
                    <h2 className="text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        Hệ thống học tập trực tuyến, <br></br>chào mừng trở lại!
                    </h2>
                </div>
                
                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm p-10 border rounded-md outline outline-1 -outline-offset-1 outline-gray-300 shadow-sm bg-white">
                    <form method="POST" className="" onSubmit={(e) => {e.preventDefault(); handlerSubmit();}} autoComplete="off">
                        <div>
                            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                Email hoặc tên đăng nhập
                            </label>
                            <div className="mt-2">
                                <input
                                    onChange={(e) => {setUsername(e.target.value); if (!!errors.username) setErrors({...errors, username: ''})}} 
                                    id="email"
                                    name="email"
                                    type="text"
                                    required
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    placeholder="Nhập email hoặc tên đăng nhập"
                                    maxLength={100}
                                />
                                <span className="text-red-600 font-normal text-sm">{errors.username || <>&nbsp;</>}</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                                    Mật khẩu
                                </label>
                                <div className="text-sm">
                                    <Link to={PAGE_LOCATION.FORGET} className="font-semibold text-indigo-600 hover:text-indigo-500">
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    onChange={(e) => {setPassword(e.target.value); if (!!errors.password) setErrors({...errors, password: ''})}}
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    placeholder="Nhập mật khẩu"
                                    maxLength={100}
                                />
                                <span className="text-red-600 font-normal text-sm">{errors.password || <>&nbsp;</>}</span>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Đăng nhập
                            </button>
                        </div>
                    </form>

                    <p className="mt-2 text-center text-sm/6 text-gray-500">
                        Chưa có tài khoản?{' '}
                        <Link to={PAGE_LOCATION.REGISTER} className="font-semibold text-indigo-600 hover:text-indigo-500">
                            Đăng ký
                        </Link>
                    </p>

                    <div className="flex flex-row flex-nowrap items-center justify-center gap-4 pb-5 pt-2">
                        <div className="h-[1px] bg-gray-200 w-full"></div>
                        <p className="text-sm text-gray-500 text-nowrap">hoặc</p>
                        <div className="h-[1px] bg-gray-200 w-full"></div>
                    </div>

                    <div className="flex flex-row flex-nowrap items-center justify-center w-full">
                        <div className="flex items-center justify-center dark:bg-gray-800 w-full">
                            <button onClick={() => document.location = getUrlGoogleLogin(process.env.REACT_APP_GOOGLE_LOGIN_REDIRECT_URI)} className="px-4 py-2 border gap-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150 w-full flex items-center justify-center">
                                <img className="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo" />
                                <span className="font-semibold">Tiếp tục với Google</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default Login;