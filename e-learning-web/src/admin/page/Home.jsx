import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { isFunction } from "../../helper/utils";

const AdminHome = () => {
    const { setTitle, setIsMainFull, handleReset } = useOutletContext()
    useEffect(() => {
        setTitle?.('Trang chủ');
        setIsMainFull?.(true)

        return () => {
            handleReset?.();
        }
    }, [])
    return (
        <div className="bg-white w-full h-full p-4">
            <h2 className="text-xl font-semibold">Trang quản trị viên</h2>
        </div>
    )
}

export default AdminHome;