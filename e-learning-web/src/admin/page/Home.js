import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { isFunctionType } from "../../helper/utils";

const AdminHome = () => {
    const { setTitle } = useOutletContext()
    useEffect(() => {
        if (isFunctionType(setTitle)) setTitle('Trang chủ')
    }, [])
    return (
        <div>

        </div>
    )
}

export default AdminHome;