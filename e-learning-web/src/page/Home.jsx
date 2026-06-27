import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

const Home = () => {
    const { setTitle, handleReset } = useOutletContext();
    useEffect(() => {
        if (setTitle) setTitle('Trang chủ');
        return () => {
            handleReset?.();
        };
    }, []);
    return 'home'
}

export default Home;