import './Template3.css'

const Template3 = ({ id, professorFullName, courseName, studentName, issueDate }) => {
    return <>
        <div className="c3-outer relative" >
            <span className='absolute bottom-2 right-1 text-xs text-[#b07fd4]'>#{id || '[ID]'}</span>
            <div className="c3-top-band"></div>
            <svg className="c3-circles-bg" width="240" height="240" viewBox="0 0 320 240"
                style={{'maxWidth': '320px', 'display': 'block', 'marginInline': 'auto'}}>
                <circle cx="180" cy="60" r="130" fill="none" stroke="#9458c0" strokeWidth="30"></circle>
            </svg>
            <svg className="c3-circles-bg2" width="200" height="200" viewBox="0 0 200 200">
                <circle cx="20" cy="180" r="110" fill="none" stroke="#9458c0" strokeWidth="25"></circle>
            </svg>
            <div className="c3-body">
                <div className="c3-header">
                    <div className="c3-logo-ring">
                        <svg viewBox="0 0 24 24" fill="none">
                            <polygon points="12,2 15,9 22,9 17,14 19,21 12,16 5,21 7,14 2,9 9,9" fill="#b07fd4"></polygon>
                        </svg>
                    </div>
                </div>
                <div className="c3-org" id="c3-org">Trung Tâm Đào Tạo Xuất Sắc</div>
                <div className="c3-hr"></div>
                <div className="c3-cert-word" style={{lineHeight: 1.2}}>Chứng Chỉ</div>
                <div className="c3-cert-sub">Certificate of Excellence</div>
                <div className="c3-ribbon">
                    <div className="c3-ribbon-line"></div>
                    <svg width="14" height="14" viewBox="0 0 14 14">
                        <polygon points="7,1 8.5,5.5 13,5.5 9.5,8.5 11,13 7,10 3,13 4.5,8.5 1,5.5 5.5,5.5" fill="#c07ad4">
                        </polygon>
                    </svg>
                    <div className="c3-ribbon-line"></div>
                </div>
                <div className="c3-award-text">Trân trọng trao tặng cho</div>
                <div className="c3-name" id="c3-name">{studentName || '[Tên học viên]'}</div>
                <div style={{'textAlign':'center'}}>
                    <div className="c3-course-box">
                        <div className="c3-course-lbl">Khóa học</div>
                        <div className="c3-course-name" id="c3-course">{courseName || '[Tên khóa học]'}</div>
                    </div>
                </div>
                <div className="c3-bottom">
                    <div className="c3-sig">
                        <div className="c3-sig-name" id="c3-s1">{professorFullName || '[Tên giám đốc đào tạo]'}</div>
                        <div className="c3-sig-line"></div>
                        <div className="c3-sig-role">Giám Đốc Đào Tạo</div>
                    </div>
                    <div className="c3-seal-center">
                        <svg width="72" height="72" viewBox="0 0 72 72">
                            <circle cx="36" cy="36" r="33" stroke="#d4a8e8" strokeWidth="1.5" fill="#fdf6fa"></circle>
                            <circle cx="36" cy="36" r="26" stroke="#d4a8e8" strokeWidth="1" fill="none"></circle>
                            <polygon points="36,14 39,24 50,24 41,31 44,41 36,34 28,41 31,31 22,24 33,24" fill="#b07fd4">
                            </polygon>
                            <text x="36" y="52" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="5.5"
                                fill="#9458c0" fontWeight="600" letterSpacing="1">CHỨNG NHẬN</text>
                        </svg>
                    </div>
                    <div className="c3-date-box">
                        <div className="c3-date-lbl">Ngày cấp</div>
                        <div className="c3-date-val !text-sm" id="c3-date">{issueDate || '[dd/mm/yyyy]'}</div>
                    </div>
                </div>
            </div>
            <div className="c3-bottom-band"></div>
        </div>
    </>
}

export default Template3;