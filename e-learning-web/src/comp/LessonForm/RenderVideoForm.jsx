import { faArrowRotateLeft, faClose, faPlay, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { VIDEO_ALLOWED_TYPE, VIDEO_MAXIMUM_SIZE_MB, VIDEO_QUALITY } from "../../define/define";
import { getUserInfo, validateVideo } from "../../helper/utils";
import { toast } from "react-toastify";
import { cancel, createSession, uploadTempVideo } from "../../service/MediaService";

const RenderVideoForm = ({ video, setVideo }) => {
    const fileRef = useRef();
    const videoRef = useRef();
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [videoSession, setVideoSession] = useState(undefined);
    const user = getUserInfo();

    const handleSessionUpdate = async (videoId, newSession, isReset) => {
        if (!newSession?.id || !video?.videoInfo?.id || video.videoInfo.id !== videoId || videoId !== newSession.videoId) return;

        const videoElm = videoRef.current;
        if (!videoElm) return;

        const state = {
            currentTime: isReset ? 0 : (videoElm.currentTime || 0),
            paused: isReset ? true : videoElm.paused,
        };

        const v = videoRef.current;
        if (!v) return;

        const updateVideo = () => {
            const source = v.querySelector("source");
            if (!source) return;

            source.src = `${process.env.REACT_APP_API_MEDIA_SERVICE_BASE_URL}/videos/play?sessionId=${newSession.id}&userId=${user.id}`;

            v.load();

            const restore = () => {
                v.currentTime = state.currentTime;

                if (!state.paused) {
                    v.play().catch(() => { });
                }
            };

            v.addEventListener("loadedmetadata", restore, { once: true });
        };

        if (v.readyState >= 1) {
            updateVideo();
        } else {
            v.addEventListener("loadedmetadata", updateVideo, { once: true });
        }
    };


    // đổi video mới
    useEffect(() => {
        if (!video?.videoInfo?.id || videoSession?.videoId === video.videoInfo.id) return;
        loadSession(video?.videoInfo?.id)
            .then(videoSession => {
                setVideoSession(videoSession);
                handleSessionUpdate(video?.videoInfo?.id, videoSession, true)
            })
            .catch((e) => {
                console.log(e)
            })
    }, [video?.videoInfo?.id])

    useEffect(() => {
        if (!videoSession?.id || !video?.videoInfo?.id) return;

        const delay = new Date(videoSession.expireAt).getTime() - Date.now();

        if (delay <= 0) {
            return;
        }

        const videoId = video.videoInfo.id;

        const interval = setInterval(async () => {
            if (video?.videoInfo?.id === videoId) {
                const videoSession = await loadSession(videoId);
                handleSessionUpdate(videoId, videoSession)
            }
            clearInterval(interval)
        }, delay);

        return () => clearInterval(interval);
    }, [videoSession?.id]);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleVideoChange(e.dataTransfer.files);
    };

    const handleVideoChange = async (files) => {
        const file = files[0];
        const validate = validateVideo(file);
        if (validate) {
            toast.error(validate)
            return;
        }
        setUploading(true);
        uploadTempVideo(file)
            .then(async (response) => {
                setUploading(false);
                let { id, url, isActive, width, height, duration, quality } = { ...response.data.data };
                if (!video.qualityDefault) 
                    video.qualityDefault = quality;
                else if (video.qualityDefault > quality)
                    video.qualityDefault = quality;
                try {
                    const videoSession = await loadSession(id);
                    setVideoSession(videoSession);
                } catch {}
                setVideo({ ...video, videoInfo: { id, url, isActive, width, height, duration, quality } })
                fileRef.current = null;
            })
            .catch(e => {
                if (e.name === "CanceledError") {
                    return;
                }

                toast.error(e.response?.data?.message || 'Có lỗi xảy ra')
            })
    }

    const loadSession = async (videoId) => {
        if (!videoId) return;
        try {
            const response = await createSession(videoId)
            return response.data.data
        } catch (e) {}
    }

    const handleReset = () => {
        const {qualityDefault, videoInfo, ...obj} = {...video}
        setVideo(obj);
        setVideoSession(undefined);
    }

    return <div className="section-card p-4">
        <div className="section-title section-color-4 flex flex-row justify-between items-center">
            <span className="space-x-2">
                <FontAwesomeIcon icon={faPlay} />
                <span>Nội dung video</span>
            </span>
            <button onClick={handleReset} type="button" disabled={!video.videoInfo} className="hover:opacity-60 disabled:opacity-60 cursor-pointer disabled:pointer-events-none">
                <FontAwesomeIcon icon={faArrowRotateLeft} />
            </button>
        </div>
        <div className="form-grid gap-4">
            {!video?.videoInfo &&
                <div
                    className={`
                        form-full thumb-upload relative overflow-hidden
                        ${dragging ? (uploading ? "" : "!border-gray-700") : ""}
                        ${uploading ? "!cursor-default" : ""}
                    `}
                    onDragOver={(e) => {
                        if (uploading) return;

                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => {
                        if (uploading) return;

                        setDragging(false);
                    }}
                    onDrop={(e) => {
                        if (uploading) return;

                        handleDrop(e);
                    }}
                    onClick={() => {
                        if (uploading) return;

                        fileRef.current?.click();
                    }}
                >
                    {!uploading && <>
                        <div className="thumb-icon">↑</div>
                        <div className="thumb-label">Kéo thả hoặc chọn video</div>
                        <div className="thumb-hint">{VIDEO_ALLOWED_TYPE.join(', ').toUpperCase()} · Tối đa {VIDEO_MAXIMUM_SIZE_MB}MB</div>
                    </>}
                    {uploading &&
                        <div className="h-[84px] flex flex-col items-center justify-center">
                            <button type="button" className="absolute top-0 left-0 text-sm p-1" onClick={e => { e.stopPropagation(); cancel(); setUploading(false) }}><FontAwesomeIcon icon={faClose} /> Hủy tải lên</button>
                            <div className="h-8 w-8 rounded-full border-4 border-gray-300 border-t-gray-700 animate-spin" />
                            <div className="mt-4 text-sm text-gray-500">
                                {"Đang tải lên...".split("").map((char, index) => (
                                    <span
                                        key={index}
                                        className="inline-block animate-wave"
                                        style={{
                                            animationDelay: `${index * 80}ms`,
                                            animationDuration: "1.2s",
                                        }}
                                    >
                                        {char === " " ? "\u00A0" : char}
                                    </span>
                                ))}
                            </div>
                        </div>}
                    <input disabled={uploading} ref={fileRef} type="file" accept="video/*" onChange={(e) => handleVideoChange(e.target.files)} className="hidden" />
                </div>
            }
            {video?.videoInfo && videoSession?.id &&
                <div className="field form-full">
                    <video
                        ref={videoRef}
                        controls
                        className="w-full max-h-[60vh] bg-black"
                    >
                        <source
                            src={`${process.env.REACT_APP_API_MEDIA_SERVICE_BASE_URL}/videos/play?sessionId=${videoSession?.id}&userId=${user.id}`}
                            type="video/mp4"
                        />
                    </video>
                </div>
            }
            <div className="field col-span-full">
                <label>Chất lượng mặc định <span className="text-red-500">*</span></label>
                <select value={video?.qualityDefault} onChange={e => setVideo({ ...video, qualityDefault: e.target.value })}>
                    <option value={''}>Chọn chất lượng</option>
                    {VIDEO_QUALITY.filter(q => q <= video?.videoInfo?.quality).map((q, index) =>
                        <option key={index} value={q}>{q}p</option>
                    )}
                </select>
            </div>
            <div className="field form-full">
                <label>Ghi chú / tóm tắt video <span className="text-red-500">*</span></label>
                <textarea value={video?.summary || ''} onChange={e => setVideo({...video, summary: e.target.value})} rows="2" placeholder="Tóm tắt những điểm chính trong video..."></textarea>
            </div>
        </div>
    </div>
}

export default RenderVideoForm;