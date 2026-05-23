import './Template1.css';

const Template1 = ({ id, professorFullName, courseName, studentName, issueDate }) => {
    return <>
        <div className="cert-wrapper !w-full relative">
            <div className="cert-border-inner"></div>

            <div className="cert-corner cc-tl">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4 L4 28 M4 4 L28 4" stroke="#c9a84c" strokeWidth="1.5" fill="none"></path>
                    <path d="M12 12 L12 24 M12 12 L24 12" stroke="#e8c97a" strokeWidth="0.7" fill="none"></path>
                    <circle cx="4" cy="4" r="2.5" fill="#c9a84c"></circle>
                    <path d="M16 4 Q20 8 16 12 Q12 8 16 4" fill="#c9a84c" opacity="0.5"></path>
                </svg>
            </div>
            <div className="cert-corner cc-tr">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4 L4 28 M4 4 L28 4" stroke="#c9a84c" strokeWidth="1.5" fill="none"></path>
                    <path d="M12 12 L12 24 M12 12 L24 12" stroke="#e8c97a" strokeWidth="0.7" fill="none"></path>
                    <circle cx="4" cy="4" r="2.5" fill="#c9a84c"></circle>
                    <path d="M16 4 Q20 8 16 12 Q12 8 16 4" fill="#c9a84c" opacity="0.5"></path>
                </svg>
            </div>
            <div className="cert-corner cc-bl">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4 L4 28 M4 4 L28 4" stroke="#c9a84c" strokeWidth="1.5" fill="none"></path>
                    <path d="M12 12 L12 24 M12 12 L24 12" stroke="#e8c97a" strokeWidth="0.7" fill="none"></path>
                    <circle cx="4" cy="4" r="2.5" fill="#c9a84c"></circle>
                    <path d="M16 4 Q20 8 16 12 Q12 8 16 4" fill="#c9a84c" opacity="0.5"></path>
                </svg>
            </div>
            <div className="cert-corner cc-br">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4 L4 28 M4 4 L28 4" stroke="#c9a84c" strokeWidth="1.5" fill="none"></path>
                    <path d="M12 12 L12 24 M12 12 L24 12" stroke="#e8c97a" strokeWidth="0.7" fill="none"></path>
                    <circle cx="4" cy="4" r="2.5" fill="#c9a84c"></circle>
                    <path d="M16 4 Q20 8 16 12 Q12 8 16 4" fill="#c9a84c" opacity="0.5"></path>
                </svg>
            </div>

            <svg className="cert-bg-watermark" width="220" height="220" viewBox="0 0 220 220" fill="none">
                <circle cx="110" cy="110" r="100" stroke="#8a6a10" strokeWidth="2"></circle>
                <circle cx="110" cy="110" r="88" stroke="#8a6a10" strokeWidth="1"></circle>
                <path d="M110 10 L120 40 L150 40 L127 58 L137 88 L110 70 L83 88 L93 58 L70 40 L100 40 Z" fill="#8a6a10">
                </path>
            </svg>

            <div>
                <div className="cert-body">
                    <div className="cert-logo-row">
                        <svg className="cert-logo-emblem" viewBox="0 0 80 80" fill="none">
                            <circle cx="40" cy="40" r="36" stroke="#c9a84c" strokeWidth="1.5">
                            </circle>
                            <circle cx="40" cy="40" r="28" stroke="#c9a84c" strokeWidth="1"></circle>
                            <path d="M40 14 L43 24 L54 24 L45 31 L48 41 L40 34 L32 41 L35 31 L26 24 L37 24 Z"
                                fill="#c9a84c"></path>
                            <text x="40" y="56" textAnchor="middle" fontFamily="Cormorant Garamond, serif"
                                fontSize="6" fill="#8a6a10" fontWeight="600" letterSpacing="1">CHỨNG NHẬN</text>
                            <text x="40" y="63" textAnchor="middle" fontFamily="Cormorant Garamond, serif"
                                fontSize="5" fill="#8a6a10" letterSpacing="0.5">CHÍNH THỨC</text>
                        </svg>
                    </div>

                    <div className="cert-org">Học Viện Đào Tạo Chuyên Nghiệp</div>

                    <div className="cert-divider-gold"></div>

                    <div className="cert-title-main">Chứng Chỉ</div>
                    <div className="cert-title-sub">Certificate of Completion</div>

                    <div className="cert-presented">Trân trọng trao tặng cho</div>

                    <div className="cert-name" id="cert-name-display">{studentName || '[Tên học viên]'}</div>

                    <div className="cert-completed-text">đã hoàn thành khóa học</div>

                    <div className="cert-course-name" id="cert-course-display">{courseName || '[Tên khóa học]'}</div>

                    <div className="cert-divider-thin"></div>

                    <div className="cert-footer !px-0 !grid grid-cols-3">
                        <div className="cert-sig-block">
                        </div>

                        <div className="cert-seal">

                        </div>

                        <div className='flex flex-row justify-center'>
                            <div></div>
                            <div className="cert-sig-block">
                                <div className="cert-date-block">
                                    <div className="cert-date-label">Ngày cấp</div>
                                    <div className="cert-date-val" id="cert-date-display">{issueDate || 'dd/mm/yyyy'}</div>
                                </div>
                                <div style={{ 'height': '10px' }}></div>
                                <div className="cert-sig-name-label" id="sig2-name">{professorFullName || '[Tên giám đốc đào tạo]'}</div>
                                <div className="cert-sig-line"></div>
                                <div className="cert-sig-title">Giám Đốc Đào Tạo</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <span className='text-center absolute bottom-2.5 left-auto right-auto w-full text-xs text-[#8a6a10]'>#{id || '[ID]'}</span>
        </div>
    </>
}

export default Template1;