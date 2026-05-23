import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { isFunction } from "../../helper/utils";

const AdminHome = () => {
    const { setTitle } = useOutletContext()
    useEffect(() => {
        if (isFunction(setTitle)) setTitle('Trang chủ')
    }, [])
    return (
        <div>

        </div>
    )
}

export default AdminHome;