import { useEffect, useState } from "react";
import { hasData, isEmailValid } from "../../helper/utils";
import { Link } from "react-router-dom";
import { PAGE_LOCATION } from "../../define/define";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { createNewPassword, sendVerifyCode } from "../../service/AuthService";

const Forget = () => {
    document.title = 'Cấp lại mật khẩu';

    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifyCode, setVerifyCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    const handleSendCode = () => {
        if (!email) {
            toast.error('Email bắt buộc nhập');
            return;
        }
        else if (!isEmailValid(email)) {
            toast.error('Email không đúng định dạng');
            return;
        }

        sendVerifyCode(email)
            .then(() => {
                toast.success('Đã gửi mã xác thực, vui lòng kiểm tra hộp thư');
            })
            .catch(() => { })
            .finally(() => {
                setStep(2);
                setTimeLeft(60);
            })
    };

    const handleSendNewPassword = () => {
        if (!hasData(verifyCode)) {
            toast.error("Mã xác thực bắt buộc nhập");
            return;
        }
        if (!email) {
            toast.error('Email bắt buộc nhập');
            return;
        }
        else if (!isEmailValid(email)) {
            toast.error('Email không đúng định dạng');
            return;
        }
        createNewPassword(email, verifyCode)
            .then(_ => {
                toast.success('Đã gửi mật khẩu mới, vui lòng kiểm tra hộp thư!')
                setVerifyCode('');
                setEmail('')
                setStep(1)
            })
            .catch(_ => { })
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
                <Link to={PAGE_LOCATION.LOGIN} className="font-semibold text-indigo-600 hover:text-indigo-500">
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    <span>Quay lại trang đăng nhập</span>
                </Link>
                <h2 className="text-xl font-bold text-center my-8">
                    Cấp lại mật khẩu
                </h2>

                {/* STEP 1 */}
                {step === 1 && (
                    <>
                        <input
                            type="text"
                            placeholder="Nhập email"
                            className="w-full border px-3 py-2 rounded"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <button
                            onClick={handleSendCode}
                            disabled={loading}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded mt-4"
                        >
                            Gửi mã xác thực
                        </button>
                    </>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <>
                        <div className="flex flex-row flex-nowrap">
                            <input
                                name="text"
                                placeholder="Nhập mã xác thực"
                                onChange={e => setVerifyCode(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                maxLength={10}
                                value={verifyCode}
                            />
                            <button
                                disabled={timeLeft > 0}
                                onClick={handleSendCode}
                                className="bg-white text-indigo-500 border-2 hover:bg-indigo-500 hover:text-white p-2 rounded-lg font-semibold transition text-nowrap ms-4 disabled:opacity-60 disabled:bg-white disabled:text-indigo-500 border-indigo-500"
                            >
                                Gửi mã {timeLeft > 0 ? ' (' + timeLeft + 's)' : ''}
                            </button>
                        </div>

                        <button
                            onClick={handleSendNewPassword}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg font-semibold transition my-4"
                        >
                            Gửi mật khẩu mới
                        </button>

                        <a href="#" className="mt-4 font-semibold text-indigo-600 hover:text-indigo-500" onClick={() => {setEmail(''); setStep(1)}}>Nhập lại email</a>
                    </>
                )}
            </div>
        </div>
    );
};

export default Forget;