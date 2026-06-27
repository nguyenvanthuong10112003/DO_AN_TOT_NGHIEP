import './style/Loading.css';
export const Loading = ({loading}) => {
    return loading && <div className="fixed w-full h-full bg-black/10 z-50 inset-0">
        <div className="loading-spinner">
            <div className="bg-gray-700"></div>    
            <div className="bg-gray-700"></div>    
            <div className="bg-gray-700"></div>    
            <div className="bg-gray-700"></div>    
            <div className="bg-gray-700"></div>    
            <div className="bg-gray-700"></div>    
            <div className="bg-gray-700"></div>    
            <div className="bg-gray-700"></div>    
            <div className="bg-gray-700"></div>   
            <div className="bg-gray-700"></div>    
        </div>
    </div>
}