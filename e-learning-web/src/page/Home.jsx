import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

const Home = () => {
    const { setTitle } = useOutletContext();
    useEffect(() => {
        if (setTitle) setTitle('Trang chủ');
    }, []);
    return 'home'
}

export default Home;