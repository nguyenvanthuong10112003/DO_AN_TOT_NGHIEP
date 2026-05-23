import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faScissors, faCheck, faUndo, faScaleBalanced, faExpand } from '@fortawesome/free-solid-svg-icons';
import CropOverlay from './ResizeImageComp/CropOverlay';
import useImageHistory from '../hooks/useImageHistory';
import useCanvasDraw from '../hooks/useCanvasDraw';
import { RATIOS } from '../define/define';
import { useOutletContext } from 'react-router-dom';
import { isFunction } from '../helper/utils';

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const PopupResizeImage = React.memo(({ imageFile, setImageFile, onClose, ratios = [RATIOS.FREE], openPopupConfirmAlert }) => {
    const [dragging, setDragging] = useState(null);
    const [cropBox, setCropBox] = useState(null);
    const canvasRef = useRef();
    const wrapRef = useRef();
    const groupBtnRef = useRef();
    const [image, setImage] = useState(null);
    const [ratio, setRatio] = useState(null);
    const imgElRef = useRef(null);
    const history = useImageHistory();
    const [isAvatar, setIsAvatar] = useState(false);
    const [scale, setScale] = useState(100)
    const [isMd, setIsMd] = useState(window.innerWidth >= 768);
    const displaySize = useMemo(() => {
        const el = wrapRef.current;
        const bl = groupBtnRef.current;
        if (!image || !el) return { w: 0, h: 0, scale: 1 };
        const maxW = el.clientWidth - 48 - (isMd ? bl.clientWidth : 0);
        const maxH = el.clientHeight - 48 - (isMd ? 0 : bl.clientHeight);
        const scale = Math.min(maxW / image.w, maxH / image.h);
        const w = Math.round(image.w * scale), h = Math.round(image.h * scale)
        return { w, h, scale };
    }, [image]);

    useEffect(() => {
        const onResize = () => {
            setIsMd(window.innerWidth >= 768);
        };

        window.addEventListener("resize", onResize);

        return () =>
            window.removeEventListener(
                "resize",
                onResize
            );
    }, []);

    useEffect(() => {
        handleRatioChange(ratios[0]?.value)
    }, [displaySize])

    useEffect(() => {
        const onMove = (e) => handleMouseMove(e);
        const onUp = () => setDragging(null);
        if (dragging) {
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [dragging]);

    useEffect(() => {
        if (!imageFile) return;
        loadFile(imageFile);
    }, [imageFile])

    useCanvasDraw(canvasRef, imgElRef.current, displaySize);

    const handleResizeStart = (anchor) => {
        if (!cropBox) return;
        setDragging({ mode: 'resize', anchor, initBox: { ...cropBox } });
    };

    const handleMouseDown = (e) => {
        if (!image) return;
        const { x, y } = toCanvas(e.clientX, e.clientY);

        if (isInsideBox(x, y)) {
            setDragging({ mode: 'move', startX: x, startY: y, initBox: { ...cropBox } });
        } else {
            setDragging({ mode: 'draw', startX: x, startY: y });
            setCropBox({ x, y, w: 0, h: 0 });
        }
    };

    const handleMouseMove = (e) => {
        if (!dragging) return;
        const pt = toCanvas(e.clientX, e.clientY);
        const { w: cw, h: ch } = displaySize;
        const MIN = 10; // minimum box size in display px

        if (dragging.mode === 'move') {
            const dx = pt.x - dragging.startX;
            const dy = pt.y - dragging.startY;
            const { initBox } = dragging;
            const nx = clamp(initBox.x + dx, 0, cw - initBox.w);
            const ny = clamp(initBox.y + dy, 0, ch - initBox.h);
            setCropBox({ x: nx, y: ny, w: initBox.w, h: initBox.h });

        } else if (dragging.mode === 'resize') {
            const { anchor, initBox: b } = dragging;

            const aspect = b.w / b.h;

            let { x, y, w, h } = b;

            const mx = clamp(pt.x, 0, cw);
            const my = clamp(pt.y, 0, ch);

            if (!ratio) {
                if (anchor.includes('n')) {
                    const newY = clamp(my, 0, b.y + b.h - MIN);

                    h = b.y + b.h - newY;
                    y = newY;
                }

                if (anchor.includes('s')) {
                    h = clamp(my - b.y, MIN, ch - b.y);
                }

                if (anchor.includes('w')) {
                    const newX = clamp(mx, 0, b.x + b.w - MIN);

                    w = b.x + b.w - newX;
                    x = newX;
                }

                if (anchor.includes('e')) {
                    w = clamp(mx - b.x, MIN, cw - b.x);
                }

                setCropBox({ x, y, w, h });
                return;
            }

            // southeast
            if (anchor === 'se') {
                w = clamp(mx - b.x, MIN, cw - b.x);
                h = w / aspect;
                if (b.y + h > ch) {
                    h = ch - b.y;
                    w = h * aspect;
                }
            }

            // southwest
            if (anchor === 'sw') {
                w = clamp(b.x + b.w - mx, MIN, b.x + b.w);
                h = w / aspect;

                x = b.x + b.w - w;

                if (b.y + h > ch) {
                    h = ch - b.y;
                    w = h * aspect;
                    x = b.x + b.w - w;
                }
            }

            // northeast
            if (anchor === 'ne') {
                w = clamp(mx - b.x, MIN, cw - b.x);
                h = w / aspect;

                y = b.y + b.h - h;

                if (y < 0) {
                    y = 0;
                    h = b.y + b.h;
                    w = h * aspect;
                }
            }

            // northwest
            if (anchor === 'nw') {
                w = clamp(b.x + b.w - mx, MIN, b.x + b.w);
                h = w / aspect;

                x = b.x + b.w - w;
                y = b.y + b.h - h;

                if (x < 0) {
                    x = 0;
                    w = b.x + b.w;
                    h = w / aspect;
                    y = b.y + b.h - h;
                }

                if (y < 0) {
                    y = 0;
                    h = b.y + b.h;
                    w = h * aspect;
                    x = b.x + b.w - w;
                }
            }

            if (anchor === 'e') {
                w = clamp(mx - b.x, MIN, cw - b.x);
                h = w / aspect;

                y = b.y;

                if (y + h > ch) {
                    h = ch - y;
                    w = h * aspect;
                }
            }

            if (anchor === 'w') {
                w = clamp(b.x + b.w - mx, MIN, b.x + b.w);
                h = w / aspect;

                x = b.x + b.w - w;

                y = b.y;

                if (y + h > ch) {
                    h = ch - y;
                    w = h * aspect;
                    x = b.x + b.w - w;
                }
            }

            if (anchor === 's') {
                h = clamp(my - b.y, MIN, ch - b.y);
                w = h * aspect;

                x = b.x;

                if (x + w > cw) {
                    w = cw - x;
                    h = w / aspect;
                }
            }


            if (anchor === 'n') {
                h = clamp(b.y + b.h - my, MIN, b.y + b.h);
                w = h * aspect;

                y = b.y + b.h - h;

                x = b.x;

                if (x + w > cw) {
                    w = cw - x;
                    h = w / aspect;
                    y = b.y + b.h - h;
                }
            }

            setCropBox({ x, y, w, h });

        } else {
            let bx = Math.min(pt.x, dragging.startX);
            let by = Math.min(pt.y, dragging.startY);
            let bw = Math.abs(pt.x - dragging.startX);
            let bh = Math.abs(pt.y - dragging.startY);

            if (ratio) {
                bh = bw / ratio;
                if (pt.y < dragging.startY) by = dragging.startY - bh;
            }

            bx = clamp(bx, 0, cw); by = clamp(by, 0, ch);
            bw = clamp(bw, 0, cw - bx); bh = clamp(bh, 0, ch - by);
            setCropBox({ x: bx, y: by, w: bw, h: bh });
        }
    };

    const createCropBox = (displaySize, value) => {
        const maxW = displaySize.w;
        const maxH = displaySize.h;

        if (!value) {
            return {
                x: 0,
                y: 0,
                w: maxW,
                h: maxH
            };
        }

        let w = maxW;
        let h = w / value;

        if (h > maxH) {
            h = maxH;
            w = h * value;
        }

        return {
            x: (maxW - w) / 2,
            y: (maxH - h) / 2,
            w,
            h
        };
    };

    const loadFile = useCallback((file) => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        const el = new Image();
        el.onload = () => {
            imgElRef.current = el;
            setImage({ src: url, w: el.naturalWidth, h: el.naturalHeight, name: file.name, el });
            setCropBox(null);
            history.clear();
        };
        el.src = url;
    }, [history]);

    const toCanvas = (clientX, clientY) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    };

    const isInsideBox = (x, y) => {
        if (!cropBox || cropBox.w < 2 || cropBox.h < 2) return false;
        return x >= cropBox.x && x <= cropBox.x + cropBox.w
            && y >= cropBox.y && y <= cropBox.y + cropBox.h;
    };

    const handleRatioChange = (value, avatar = false) => {
        setRatio(value);
        setIsAvatar(avatar);
        setCropBox(createCropBox(displaySize, value));
    }

    const applyCrop = useCallback(() => {
        if (!cropBox || cropBox.w < 2 || cropBox.h < 2 || !image) return;
        const s = displaySize.scale;
        const sx = cropBox.x / s, sy = cropBox.y / s;
        const sw = cropBox.w / s, sh = cropBox.h / s;

        const tmp = document.createElement('canvas');
        tmp.width = sw; tmp.height = sh;
        tmp.getContext('2d').drawImage(imgElRef.current, -sx, -sy, image.w, image.h);

        const newSrc = tmp.toDataURL('image/png');
        const newEl = new Image();
        newEl.onload = () => {
            history.push({ src: image.src, w: image.w, h: image.h });
            imgElRef.current = newEl;
            setImage({ src: newSrc, w: sw, h: sh, name: image.name, el: newEl });
            setCropBox(null);
        };
        newEl.src = newSrc;
    }, [cropBox, image, displaySize, history]);

    const handleUndo = () => {
        const snap = history.pop();
        if (!snap) return;
        const el = new Image();
        el.onload = () => {
            imgElRef.current = el;
            setImage({ src: snap.src, w: snap.w, h: snap.h, name: image.name, el });
            setCropBox(null);
        };
        el.src = snap.src;
    };

    const handleExport = async () => {
        if (!canvasRef.current) return;

        const filename =
            (image?.name || 'image').replace(/\.[^.]+$/, '') +
            '_edited.png';

        const blob = await new Promise((resolve) =>
            canvasRef.current.toBlob(resolve, 'image/png')
        );

        if (!blob) return;

        const file = new File(
            [blob],
            filename,
            {
                type: 'image/png',
                lastModified: Date.now(),
            }
        );

        setImageFile?.(file);
        reset();
        onClose?.();
    };

    const hasSelection = () => cropBox && cropBox.w > 2 && cropBox.h > 2;

    const reset = () => {
        setDragging(null);
        setCropBox(null);
        canvasRef.current = null;
        wrapRef.current = null;
        setImage(null);
        setRatio(null);
        imgElRef.current = null;
        history.clear()
        setIsAvatar(false);
        setScale(100);
    }

    const handleClose = () => {
        const callBack = () => {
            reset();
            onClose?.();
        }
        if (isFunction(openPopupConfirmAlert))
            openPopupConfirmAlert({ type: 'warning', title: 'Xác nhận hủy', label: 'Bạn có chắc muốn hủy thay đổi?', onAccept: callBack })
        else callBack();
    }

    const isLandscape = () => image ? image.w > image.h : false;

    const handleApplyScale = () => {
        if (!scale || !image) return;

        const ratio = scale / 100;
        const canvas = document.createElement("canvas");
        const newW = Math.round(image.w * ratio);
        const newH = Math.round(image.h * ratio);
        canvas.width = newW;
        canvas.height = newH;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(
            imgElRef.current,
            0,
            0,
            newW,
            newH
        );

        const newSrc = canvas.toDataURL("image/png");

        const newEl = new Image();

        newEl.onload = () => {
            history.push({
                src: image.src,
                w: image.w,
                h: image.h
            });

            imgElRef.current = newEl;

            setImage({
                src: newSrc,
                w: newW,
                h: newH,
                name: image.name,
                el: newEl
            });

            setScale(100);
        };

        newEl.src = newSrc;
    };

    return imageFile && (
        <div className="fixed inset-0 z-[25] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={handleClose}>
            <div
                className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl h-full max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                            <FontAwesomeIcon icon={faScissors} className="text-violet-600 text-xs" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-800">Chỉnh sửa ảnh</h2>
                            {image && (
                                <p className="text-[10px] text-gray-400 ">
                                    {image.w} × {image.h} px
                                    &nbsp;·&nbsp;
                                    {isLandscape() ? '🏞 Ảnh ngang' : '🖼 Ảnh dọc'}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="w-8 h-8 border rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
                    >
                        <FontAwesomeIcon icon={faClose} className="text-sm" />
                    </button>
                </div>

                <div className={`flex flex-1 max-h-full max-w-full flex-col md:flex-row`} ref={wrapRef}>

                    <div
                        className="crop-mode flex-1 flex items-center justify-center overflow-hidden relative bg-[#f8f8f8] p-6"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #d4d4d8 1px, transparent 1px)',
                            backgroundSize: '18px 18px'
                        }}
                    >
                        {image ? (
                            <div
                                className="relative inline-block"
                                onMouseDown={handleMouseDown}
                                onMouseMove={(e) => {
                                    handleMouseMove(e);
                                    if (!dragging && canvasRef.current) {
                                        const { x, y } = toCanvas(e.clientX, e.clientY);
                                        e.currentTarget.style.cursor = isInsideBox(x, y) ? 'move' : 'crosshair';
                                    }
                                }}
                                onMouseUp={() => setDragging(null)}
                                onMouseLeave={() => setDragging(null)}
                            >
                                <canvas ref={canvasRef} className="block rounded shadow-sm" />
                                <CropOverlay
                                    cropBox={cropBox}
                                    scale={displaySize.scale}
                                    isAvatar={isAvatar}
                                    onResizeStart={handleResizeStart}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">🖼️</div>
                                <p className="text-sm">Đang tải ảnh...</p>
                            </div>
                        )}
                    </div>

                    <div
                        ref={groupBtnRef}
                        className={`bg-white border-gray-100 w-full md:w-80
                                border-t px-5 py-4
                                md:border-l md:px-4 md:py-5 md:border-t-0`}
                    >
                        <div className={`flex flex-col h-full gap-2 w-auto`}>
                            <div className={''}>
                                <div className={`flex flex-row flex-wrap justify-center gap-2 items-stretch`}>
                                    {cropBox?.h > 0 && cropBox?.w > 0 && <span className='text-sm border flex items-center justify-center px-2 rounded-md'>{Math.floor(cropBox?.w / displaySize?.scale)}x{Math.floor(cropBox?.h / displaySize?.scale)}</span>}
                                    {ratios.map((r) => {
                                        const active = r.avatar ? isAvatar : (!isAvatar && ratio === r.value);
                                        return (
                                            <button
                                                key={r.label}
                                                type="button"
                                                onClick={() => handleRatioChange(r.value, r.avatar)}
                                                disabled={ratios.length === 1}
                                                className={`
                                    px-2 py-1.5 rounded-md border text-xs font-medium transition-all
                                    ${active || ratios.length === 1
                                                        ? 'bg-violet-50 border-violet-500 text-violet-600'
                                                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300'}
                                `}
                                            >
                                                {r.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <hr></hr>

                            <div className='flex flex-col items-center'>
                                <span className='w-full max-w-80 text-sm flex flex-row justify-between'>
                                    <span>{scale}%</span>
                                    <span>{Math.round(image?.w * scale / 100)}x{Math.round(image?.h * scale / 100)}</span>
                                </span>
                                <input
                                    className='w-full max-w-80'
                                    type="range"
                                    min={1}
                                    max={100}
                                    step={1}
                                    value={scale}
                                    onChange={(e) => setScale(+e.target.value)}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onMouseMove={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>

                            <hr></hr>

                            <div className={`flex gap-2 justify-center flex-wrap }`}>
                                <button
                                    type="button"
                                    onClick={handleUndo}
                                    disabled={!history.canUndo}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <FontAwesomeIcon icon={faUndo} className="text-[11px]" />
                                    Hoàn tác
                                </button>

                                <button
                                    type="button"
                                    onClick={handleApplyScale}
                                    disabled={scale === 100}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-500 bg-violet-50 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <FontAwesomeIcon icon={faExpand} className="text-[11px]" />
                                    Áp dụng tỷ lệ
                                </button>

                                <button
                                    type="button"
                                    onClick={applyCrop}
                                    disabled={!hasSelection()}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-violet-500 bg-violet-50 text-xs font-semibold text-violet-600 hover:bg-violet-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <FontAwesomeIcon icon={faScissors} className="text-[11px]" />
                                    Áp dụng cắt
                                </button>

                                <button
                                    type="button"
                                    onClick={handleExport}
                                    disabled={!history.canUndo}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-xs font-semibold text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <FontAwesomeIcon icon={faCheck} className="text-[11px]" />
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default PopupResizeImage;
