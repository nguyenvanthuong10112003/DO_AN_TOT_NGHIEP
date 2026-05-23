import './Template2.css'

const Template2 = ({id, professorFullName, courseName, studentName, issueDate}) => {
    return (
        <div className="c2-wrap">
            <div className="c2-accent-bar"></div>
            <div className="c2-accent-bar2"></div>

            <svg
                className="c2-bg-geo"
                width="320"
                height="320"
                viewBox="0 0 320 320"
            >
                <circle cx="160" cy="160" r="140" />
                <circle cx="160" cy="160" r="100" />
                <circle cx="160" cy="160" r="60" />
                <line x1="20" y1="160" x2="300" y2="160" />
                <line x1="160" y1="20" x2="160" y2="300" />
            </svg>

            <div className="c2-top-line">
                <div className="c2-badge">
                    <svg viewBox="0 0 28 28">
                        <polygon points="14,2 17,10 26,10 19,16 22,24 14,19 6,24 9,16 2,10 11,10" fill='#fff' />
                    </svg>
                </div>
                <div className="c2-org-text">
                    <div className="c2-org-name">Học Viện Đào Tạo Chuyên Nghiệp</div>
                    <div className="c2-org-sub !text-gray-300">Professional Training Academy</div>
                </div>
            </div>

            <div className="c2-cert-label">Certificate of Achievement</div>
            <div className="c2-main-title">
                Chứng <em>Chỉ</em>
            </div>

            <div className="c2-divider"></div>

            <div className="c2-presented !text-gray-300">Cấp cho học viên</div>
            <div className="c2-name">{studentName || '[Tên học viên]'}</div>

            <div className="c2-course-row">
                <div className="c2-course-lbl !text-gray-300">Khóa học hoàn thành</div>
                <div className="c2-course-val">
                    {courseName || '[Tên khóa học]'}
                </div>
            </div>

            <div className="c2-bottom">
                <div className="c2-signatures">
                    <div className="c2-sig-group">
                        <div className="c2-sig-name">{professorFullName || '[Tên giám đốc đào tạo]'}</div>
                        <div className="c2-sig-role !text-gray-300">Giám Đốc Đào Tạo</div>
                    </div>
                </div>

                <div className="c2-date-group">
                    <div className="c2-date-lbl !text-gray-300">Ngày cấp</div>
                    <div className="c2-date-val">{issueDate || 'dd/mm/yyyy'}</div>
                    <div className="c2-id !text-gray-300">#{id || '[ID]'}</div>
                </div>
            </div>
        </div>
    );
};

export default Template2;