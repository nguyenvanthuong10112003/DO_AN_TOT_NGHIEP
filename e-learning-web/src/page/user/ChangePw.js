import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { LOCAL_STORAGE_KEY, PAGE_LOCATION } from "../../define/define";
import { toast } from "react-toastify";
import { createNewPassword, sendVerifyCode } from "../../service/AuthService";
import { getEmail, hasData } from "../../helper/utils";
import { changePassword } from "../../service/UserService";

const ChangePassword = () => {
    const { setControllers, setTitle } = useOutletContext();
    const [timeLeft, setTimeLeft] = useState(0);
    useEffect(() => {
        if (setTitle instanceof Function) setTitle('Đổi mật khẩu');
        if (setControllers instanceof Function) setControllers([{ name: 'Người dùng' }, { name: 'Thông tin cá nhân', url: PAGE_LOCATION.USER_INFO }, { name: 'Đổi mật khẩu' }]);
    }, []);
    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [verifyCode, setVerifyCode] = useState('');

    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    const handleSendCode = () => {
        const email = getEmail();
        if (!hasData(email)) {
            toast.error('Vui lòng cập nhật email của bạn trước!')
            return;
        }
        sendVerifyCode(email)
            .then(_ => {
                setTimeLeft(60);
                toast.success('Gửi thành công, vui lòng kiểm tra hộp thư!')
            })
            .catch(_ => {})
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (!form.oldPassword) {
            toast.error('Mật khẩu cũ bắt buộc nhập');
            return;
        }
        if (form.oldPassword.length < 5 || form.oldPassword.length > 100 || 
            form.newPassword.length < 5 || form.newPassword.length > 100 || 
            form.confirmPassword.length < 5 || form.confirmPassword.length > 100
        ) {
            toast.error('Mật khẩu chỉ từ 5 đến 100 ký tự');
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            toast.error("Mật khẩu không khớp!");
            return;
        }
        if (form.oldPassword === form.newPassword) {
            toast.error('Mật khẩu cũ và mật khẩu mới không thể trùng nhau')
            return;
        }

        changePassword({...form})
            .then(_ => {
                setForm({        
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: ""}
                )
                toast.success('Đổi mật khẩu thành công');
            })
            .catch(_ => {})
    };

    const handleSendNewPassword = () => {
        if (!hasData(verifyCode)) {
            toast.error("Mã xác thực bắt buộc nhập");
            return;
        }
        const email = getEmail();
        if (!hasData(email)) {
            toast.error('Vui lòng cập nhật email của bạn trước!')
            return;
        }
        createNewPassword(email, verifyCode)
            .then(_ => {
                toast.success('Gửi thành công, vui lòng kiểm tra hộp thư!')
                setVerifyCode('');
            })
            .catch(_ => {})
    };

    return (
        <div className="flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl p-6 space-y-6 border bg-white">

                {/* Title */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Đổi mật khẩu
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Cập nhật thông tin bảo mật của bạn
                    </p>
                </div>

                {/* Change password */}
                <div className="space-y-4">
                    <input
                        name="oldPassword"
                        type="password"
                        placeholder="Mật khẩu cũ"
                        onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        value={form.oldPassword}
                        maxLength={100}
                    />

                    <input
                        name="newPassword"
                        type="password"
                        placeholder="Mật khẩu mới"
                        onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        value={form.newPassword}
                        maxLength={100}
                    />

                    <input
                        name="confirmPassword"
                        type="password"
                        placeholder="Nhập lại mật khẩu"
                        onChange={handleChange}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        value={form.confirmPassword}
                        maxLength={100}
                    />

                    <button
                        onClick={handleSubmit}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition"
                    >
                        Đổi mật khẩu
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-gray-400 text-sm">hoặc</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Reset password */}
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 text-center">
                        Quên mật khẩu? <br></br> <span className="text-gray-500 text-xs">Nhập mã xác thực gửi về email để nhận mật khẩu mới</span>
                    </p>

                    <div className="flex flex-row flex-nowrap">
                        <input
                            name="text"
                            placeholder="Nhập mã xác thực"
                            onChange={e => setVerifyCode(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                            maxLength={10}
                            value={verifyCode}
                        />
                        <button
                            disabled={timeLeft > 0}
                            onClick={handleSendCode}
                            className="bg-white text-orange-500 border-2 border-orange-500 hover:bg-orange-500 hover:text-white p-2 rounded-lg font-semibold transition text-nowrap ms-4 disabled:opacity-60 disabled:bg-white disabled:text-orange-500"
                        >
                            Gửi mã {timeLeft > 0 ? ' (' + timeLeft + 's)' : ''}
                        </button>
                    </div>

                    <button
                        onClick={handleSendNewPassword}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition"
                    >
                        Gửi mật khẩu mới
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChangePassword;