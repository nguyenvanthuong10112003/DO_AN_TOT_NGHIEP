import './Template4.css';

const Template4 = ({ id, professorFullName, courseName, studentName, issueDate }) => {
    return <>
        <div className="c4-wrap">
            <div className="c4-header-bar">
                <div className="c4-logo-area">
                    <div className="c4-logo-box">
                        <svg viewBox="0 0 26 26" fill="none">
                            <rect x="2" y="2" width="10" height="10" fill="white" opacity=".9"></rect>
                            <rect x="14" y="2" width="10" height="10" fill="white" opacity=".5"></rect>
                            <rect x="2" y="14" width="10" height="10" fill="white" opacity=".5"></rect>
                            <rect x="14" y="14" width="10" height="10" fill="white" opacity=".9"></rect>
                        </svg>
                    </div>
                    <div className="c4-org-block">
                        <div className="c4-org-name" id="c4-org">Học Viện Đào Tạo Chuyên Nghiệp</div>
                        <div className="c4-org-sub">Professional Training Academy</div>
                    </div>
                </div>
                <div className="c4-header-right">
                    <div className="c4-cert-no">Mã chứng chỉ</div>
                    <div className="c4-cert-no-val">#{id || '[ID]'}</div>
                </div>
            </div>
            <div className="c4-body">
                <div className="c4-row1">
                    <div className="c4-left">
                        <div className="c4-cert-type">Certificate of Completion</div>
                        <div className="c4-cert-title">Chứng Chỉ<br/><em>Hoàn Thành</em></div>
                        <div className="c4-ribbon-bar"></div>
                        <div className="c4-present-text font-semibold">Cấp cho học viên</div>
                        <div className="c4-name" id="c4-name">{studentName || '[Tên học viên]'}</div>
                    </div>
                    <div className="c4-right">
                        <div className="c4-stamp">
                            <svg viewBox="0 0 90 90" fill="none">
                                <circle cx="45" cy="45" r="42" stroke="#1a6fc4" strokeWidth="1.5"></circle>
                                <circle cx="45" cy="45" r="34" stroke="#7fb3e0" strokeWidth="1"></circle>
                                <polygon points="45,20 49,33 63,33 52,42 56,55 45,46 34,55 38,42 27,33 41,33"
                                    fill="#1a6fc4"></polygon>
                                <text x="45" y="67" textAnchor="middle" fontFamily="Source Sans 3,sans-serif"
                                    fontSize="6" fill="#0a3d6b" fontWeight="600" letterSpacing="1">CHỨNG NHẬN</text>
                                <text x="45" y="74" textAnchor="middle" fontFamily="Source Sans 3,sans-serif"
                                    fontSize="5" fill="#4a9ad4" letterSpacing=".5">CHÍNH THỨC</text>
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="c4-course-section">
                    <div className="c4-course-lbl">Khóa học đã hoàn thành</div>
                    <div className="c4-course-val" id="c4-course">{courseName || '[Tên khóa học]'}</div>
                </div>
                <div className='flex flex-row justify-between'>
                    <div className="c4-signatures">
                        <div className="c4-sig-group">
                            <div className="c4-sig-name">{professorFullName || '[Tên giám đốc đào tạo]'}</div>
                            <div className="c4-sig-role !text-[#4a9ad4]">Giám Đốc Đào Tạo</div>
                        </div>
                    </div>

                    <div className="c4-date-group">
                        <div className="c4-date-lbl !text-[#4a9ad4]">Ngày cấp</div>
                        <div className="c4-date-val">{issueDate || '[dd/mm/yyyy]'}</div>
                    </div>
                </div>
            </div>

        </div>
    </>

}


export default Template4;