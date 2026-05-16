import { useEffect, useState } from "react";

const ImageViewer = ({ imageUrl, onClose }) => {
    useEffect(() => {
        setScale(1); // reset zoom khi imageUrl thay đổi
    }, [imageUrl]);
    const [scale, setScale] = useState(1);

    const handleWheel = (e) => {
        e.preventDefault();

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale((prev) => {
            const next = prev + delta;
            return Math.min(Math.max(next, 1), 3); // giới hạn zoom
        });
    };

    const handleClick = () => {
        setScale((prev) => (prev === 1 ? 3 : 1)); // toggle zoom
    };

    return imageUrl && (
        <div className="fixed inset-0 bg-black/20 z-50">
            <div
                className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                onClick={onClose} // click ngoài đóng
            >
                <div
                    className="relative max-w-3xl max-h-full"
                    onClick={(e) => e.stopPropagation()} // tránh đóng khi click ảnh
                >
                    <button
                        onClick={onClose}
                        className="absolute -top-8 right-0 text-white text-xl cursor-pointer"
                    >
                        ✕
                    </button>

                    <img
                        onWheel={handleWheel}
                        src={imageUrl}
                        alt="full"
                        className={`max-h-[80vh] shadow-lg transition-transform duration-200 cursor-zoom-in hover:scale-110 ${scale > 1 ? "cursor-zoom-out" : "cursor-zoom-in"}`}
                        style={{
                            transform: `scale(${scale})`,
                            
                        }}
                        onClick={handleClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default ImageViewer;