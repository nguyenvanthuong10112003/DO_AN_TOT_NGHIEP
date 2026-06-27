import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { deepEquals, formatNumber, hasData, promotionDisplay } from "../../helper/utils";
import { COURSE_PRICE_RANGE, COURSE_SORT_BY, COURSE_TYPE, DIFFICULT, EvaluateStar, LANGUAGE, PAGE_LOCATION, PROMOTION_TYPE, SORT_MODE } from "../../define/define";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAward, faBroom, faBroomBall, faFilter, faSearch, faStar } from "@fortawesome/free-solid-svg-icons";
import { getAllSector, getAllTopic, searchCourseLimit, subscribeCourse } from "../../service/CourseService";
import { Award, StarIcon } from "lucide-react";
import { flushSync } from "react-dom";
import { toast } from "react-toastify";

const defaultParams = () => ({ sortMode: SORT_MODE.ASC, sortBy: COURSE_SORT_BY.NAME.key, keyword: '' });

const CourseIndex = () => {
  const { setTitle, setIsMainFull, setBgColor, handleReset, openPopupConfirmAlert } = useOutletContext()
  const [params, setParams] = useState(defaultParams());
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [showFilter, setShowFilter] = useState(false);
  const [allSector, setAllSector] = useState([]);
  const navigate = useNavigate();
  const [resultSearch, setResultSearch] = useState({})
  const loadMoreRef = useRef(null);
  useEffect(() => {
    setTitle?.('Danh sách khóa học')
    setIsMainFull?.(true)
    setBgColor?.('bg-white')

    getAllSector()
      .then(res => {
        setAllSector(res.data.data);
      }).catch(_ => { })

    return () => {
      handleReset?.();
    };
  }, [])
  useEffect(() => {
    if (pageNumber !== 1) {
      setPageNumber(1)
      setResultSearch({})
    } else if (Object.keys(resultSearch)?.length > 0) {
      setResultSearch({});
      search(1, false);
    }
  }, [params]);
  useEffect(() => {
    search(pageNumber, true);
  }, [pageNumber]);
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        if (
          entries[0].isIntersecting && resultSearch?.totalPage > 1 && pageNumber < resultSearch?.totalPage
        ) {
          setPageNumber(prev => prev + 1);
        }
      },
      {
        //root: null,
        //rootMargin: "0px 0px 0px 0px",
        threshold: 1
      }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [resultSearch?.list]);

  const search = (page, check) => {
    if (check && resultSearch?.loadedPages?.[page] === true) return;
    searchCourseLimit({ ...params, pageNumber: page, pageSize, sectorId: params.sectorSelected?.id, topicId: params.topicSelected?.id, ...(COURSE_PRICE_RANGE[params.priceRange] || {}) })
      .then(res => {
        const response = res.data.data;
        if (check && (page !== response.pageNumber || resultSearch?.loadedPages?.[page] === true)) return;
        setResultSearch(prev => ({
          list: [...(page > 1 ? (prev?.list || []) : []), ...(response?.list || [])],
          totalRecord: response.totalRecord,
          totalPage: response.totalPage,
          loadedPages: { ...(prev.loadedPages || {}), [page]: true }
        }));
      }).catch(_ => { });
  };

  const handleSectorChange = async (e) => {
    const id = e.target.value;
    let sector = allSector.find(s => s.id === e.target.value);
    const prev = { ...params };
    if (hasData(sector)) {
      if (!hasData(sector?.topics)) {
        const response = await getAllTopic(id);
        sector = { ...sector, topics: response.data.data };
        setAllSector(prevSectors => prevSectors.map(s => s.id === sector.id ? sector : s));
      }
      if (hasData(prev.topicSelected) && prev.topicSelected.sectorId !== sector.id)
        prev.topicSelected = undefined;
    }
    prev.sectorSelected = sector;
    setParams(prev);
  }

  const handleTopicChange = (e) => {
    const id = e.target.value;
    const topic = params?.sectorSelected?.topics?.find(t => t.id === id);
    const prev = { ...params, topicSelected: topic };
    setParams(prev);
  }

  const handleSubscribeCourse = (courseId) => {
    const callback = () =>
      subscribeCourse(courseId)
        .then(res => {
          const sub = res.data.data;
          setResultSearch(prev => ({ ...prev, list: prev?.list?.map(course => course.id === courseId ? ({ ...course, subscribe: sub }) : course) }))
          toast.success('Đăng ký khóa học thành công!')
        })
        .catch(() => { })

    openPopupConfirmAlert({
      type: 'info',
      title: 'Xác nhận đăng ký',
      label: 'Bạn có chắc muốn đăng ký khóa học?',
      onAccept: callback
    })
  }

  return <>
    <div className="pg p-4">

      <div className="topbar">
        <div className="topbar-left">
          <div className="pg-title font-semibold">
            Khám phá khóa học
          </div>

          <div className="pg-sub !text-sm mt-1 mb-2">
            Tìm và đăng ký khóa học phù hợp với mục tiêu của bạn
          </div>
        </div>
      </div>

      <div className="toolbar !items-stretch flex-col !gap-0">
        <div className="w-full max-w-full flex flex-row flex-nowrap justify-stretch gap-2">
          <div className="w-full flex-1 @md:max-w-3xl flex flex-row items-center border border-color-secondary rounded-lg px-2 text-sm focus-within:border-color-primary focus-within:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <FontAwesomeIcon icon={faSearch} className="" />
            <input
              value={params?.keyword || ''}
              className="w-full border-none focus:ring-0 focus:outline-none ms-2 py-[7px] text-sm"
              type="text"
              placeholder="Tìm kiếm khóa học..."
              onChange={(e) => setParams(prev => ({ ...prev, keyword: e.target.value }))}
            />
          </div>
          <button
            type="button"
            onClick={() => setParams(defaultParams())}
            className=" rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-all px-2 disabled:pointer-events-none disabled:opacity-60"
            title="Xóa bộ lọc"
            disabled={deepEquals(params, defaultParams())}
          >
            <FontAwesomeIcon icon={faBroom} />
          </button>
          <button
            type="button"
            onClick={() => setShowFilter(prev => !prev)}
            className=" rounded-lg border border-gray-300 text-blue-600 hover:bg-blue-50 transition-all px-2"
            title="Bộ lọc tìm kiếm"
          >
            <FontAwesomeIcon icon={faFilter} />
          </button>
        </div>

        {<div className={`flex flex-row flex-wrap gap-2 transition duration-300 ${showFilter ? 'opacity-100 translate-y-0 mt-2' : 'max-h-0 opacity-0 -translate-y-2 overflow-hidden'}`}>
          <select value={params?.sectorSelected?.id || ''} className="max-w-full w-full @sm:w-auto @sm:max-w-60 filter-select focus:border-color-primary focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]" onChange={handleSectorChange}>
            <option value="">
              Lĩnh vực
            </option>
            {allSector.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>

          <select value={params?.topicSelected?.id || ''} className="max-w-full w-full @sm:w-auto @sm:max-w-60 filter-select focus:border-color-primary focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]" onChange={handleTopicChange}>
            <option value="">
              Chủ đề
            </option>
            {[...(params?.sectorSelected?.topics || [])].map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>

          <select title="Ngôn ngữ" value={params?.language || ''} className="max-w-full w-full @sm:w-auto @sm:max-w-60 filter-select focus:border-color-primary focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]"
            onChange={e => setParams(prev => ({ ...prev, language: e.target.value }))}>
            <option value="">
              Ngôn ngữ
            </option>
            {Object.keys(LANGUAGE).map((key, index) => {
              return <option key={index} value={key}>
                {LANGUAGE[key]}
              </option>
            })}

          </select>

          <select title="Độ khó" value={params?.difficult || ''} className="max-w-full w-full @sm:w-auto @sm:max-w-60 filter-select focus:border-color-primary focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]"
            onChange={e => setParams(prev => ({ ...prev, difficult: e.target.value }))}>
            <option value="">
              Độ khó
            </option>
            {Object.keys(DIFFICULT).map((key, index) => {
              return <option key={index} value={key}>
                {DIFFICULT[key]}
              </option>
            })}
          </select>

          <select title="Loại khóa học" value={params?.type || ''} className="max-w-full w-full @sm:w-auto @sm:max-w-60 filter-select focus:border-color-primary focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]"
            onChange={e => setParams(prev => ({ ...prev, type: e.target.value, priceRange: undefined }))}>
            <option value="">
              Loại khóa học
            </option>
            {Object.keys(COURSE_TYPE).map((key, index) => {
              return <option key={index} value={key}>
                {COURSE_TYPE[key]}
              </option>
            })}
          </select>

          {params.type === 'PAID' && <select title="Khoảng giá" value={params?.priceRange || ''} className="max-w-full w-full @sm:w-auto @sm:max-w-60 filter-select focus:border-color-primary focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]"
            onChange={e => setParams(prev => ({ ...prev, priceRange: e.target.value }))}>
            <option value="">
              Khoảng giá
            </option>
            {COURSE_PRICE_RANGE.map((item, index) => {
              return <option key={index} value={index}>
                {hasData(item.priceFrom) && hasData(item.priceTo) ? `Từ ${formatNumber(item.priceFrom)}đ đến ${formatNumber(item.priceTo)}đ` : (
                  hasData(item.priceFrom) ? `Trên ${formatNumber(item.priceFrom)}đ` :
                    hasData(item.priceTo) ? `Dưới ${formatNumber(item.priceTo)}đ` : ''
                )}
              </option>
            })}
          </select>}

          <select title="Đánh giá" value={params?.evaluate || ''} className="max-w-full w-full @sm:w-auto @sm:max-w-60 filter-select focus:border-color-primary focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]"
            onChange={e => setParams(prev => ({ ...prev, evaluate: e.target.value }))}>
            <option value="">
              Đánh giá
            </option>
            {EvaluateStar.map((value, index) => {
              return <option key={index} value={value} className="">
                {'⭐'.repeat(value)}
              </option>
            })}
          </select>
        </div>}
      </div>

      <div className="sort-row flex flex-row items-center">
        <div className="result-count">Tổng cộng {resultSearch?.totalRecord || 0} khóa học</div>
        <div className="sort-wrap">
          <span className="sort-label">Sắp xếp</span>
          <select className="sort-sel bg-white" aria-label="Sắp xếp khóa học">
            <option value="popular">Phổ biến nhất</option>
            <option value="rating">Đánh giá cao nhất</option>
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
          </select>
        </div>
      </div>

      <hr></hr>

      {resultSearch?.totalRecord > 0 && (
        <>
          <div className="courses-grid mt-4">
            {resultSearch?.list?.map((course) => {
              const isFree = course.type === 'FREE';
              const hasPromo = !isFree && course.promotion > 0;
              const origPrice = hasPromo
                ? (course.promotionType === PROMOTION_TYPE.MONEY.id ? course.price - course.promotion : Math.ceil(course.price - course.price * (course.promotion / 100)))
                : null;

              return (
                <article
                  key={course.id}
                  className="course-card"
                  onClick={() => navigate(PAGE_LOCATION.USER_COURSE_DETAIL(course.id))}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      e.preventDefault();
                      navigate(PAGE_LOCATION.USER_COURSE_DETAIL(course.id));
                    }
                  }}
                >
                  {/* Thumbnail */}
                  <div className="cc-thumb">
                    <img
                      src={course.thumbnail || '/img/course-img-default.jpg'}
                      alt={course.name}
                      loading="lazy"
                      className="border-b pointer-events-none"
                    />

                    <div className="cc-badges-tl" title="Giảm giá">
                      {course.promotion && (
                        <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-xs font-semibold text-rose-600">-{promotionDisplay(course.promotion, course.promotionType)}</span>
                      )}
                    </div>

                    <div className="cc-badges-tr">
                      <span className="cc-badge b-level" title="Độ khó">
                        {DIFFICULT[course.difficult]}
                      </span>
                      {course.issuingCertificate && (
                        <span className="cc-badge b-cert" title="Cấp chứng chỉ">
                          <Award size={11} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="cc-body">
                    <div
                      className="cc-field flex flex-row items-center"
                      title={course.sector?.name + ' › ' + course.topic?.name}
                    >
                      {course.sector?.name} <span className="cc-sep"><span className="font-semibold">&nbsp;/&nbsp;</span></span> {course.topic?.name}
                    </div>

                    <h3 className="cc-name" title={course.name}>
                      {course.name}
                    </h3>

                    <p className="cc-note" title={course.description}>
                      {course.description}
                    </p>

                    {/* Rating */}
                    <div className="cc-rating">
                      <span className="cc-stars">★</span>
                      <span className="cc-rating-val">
                        {course.evaluate?.toFixed(1) ?? '0.0'}
                      </span>
                      <span className="cc-rating-cnt">
                        ({course.countEvaluate ?? 0} đánh giá)
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="cc-stats">
                      <div className="stat-cell">
                        <i className="ti ti-users"></i>
                        <span>{course.countSubscribe ?? 0} học viên</span>
                      </div>
                      <div className="stat-cell">
                        <i className="ti ti-book"></i>
                        <span>{course.countLesson ?? 0} bài · {course.totalTime ?? 0} phút</span>
                      </div>
                      <div className="stat-cell">
                        <i className="ti ti-user-check"></i>
                        <span className="cc-truncate">{course.professorName}</span>
                      </div>
                      <div className="stat-cell">
                        <Award className="ti ti-award"
                          size={15}
                          style={{
                            color: course.issuingCertificate
                              ? 'var(--cc-cert-color)'
                              : 'var(--color-text-tertiary)',
                          }} />
                        <span
                          style={{
                            color: course.issuingCertificate
                              ? 'var(--cc-cert-color)'
                              : undefined,
                          }}
                        >
                          {course.issuingCertificate ? 'Cấp chứng chỉ' : 'Không chứng chỉ'}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="cc-footer flex-wrap !mt-auto">
                      {!course.subscribe && <div className="cc-price-wrap flex-col-reverse">
                        {(isFree ? (
                          <span className="cc-price-free !text-green-600">
                            <i className="ti ti-lock-open"></i> Miễn phí
                          </span>
                        ) : (
                          <>
                            <span className="cc-price">
                              {formatNumber(hasPromo ? origPrice : course.price)} VNĐ
                            </span>
                            {hasPromo && (
                              <span className="cc-price-orig">
                                {formatNumber(course.price)}
                              </span>
                            )}
                          </>
                        ))}
                      </div>}

                      {course.subscribe ?
                        <div className="w-full h-full text-right"> <span className="font-semibold text-sm text-green-600">Đã đăng ký</span> </div>
                        : (isFree ? (
                          <button
                            className="cc-btn cc-btn-primary cc-btn-enroll block"
                            onClick={(e) => { e.stopPropagation(); handleSubscribeCourse(course.id) }}
                          >
                            Đăng ký
                          </button>
                        ) : (
                          <div className="cc-actions">
                            <button
                              className="cc-btn cc-btn-icon"
                              title="Thêm vào giỏ hàng"
                              aria-label="Thêm vào giỏ hàng"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <i className="ti ti-shopping-cart-plus"></i>
                            </button>
                            <button
                              className="cc-btn cc-btn-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              Mua
                            </button>
                          </div>
                        )
                        )
                      }
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <div ref={loadMoreRef} />
        </>
      )}
      {!(resultSearch?.totalRecord > 0) && <div className="empty">
        <i className="ti ti-search-off" aria-hidden="true"></i>
        <p>Không tìm thấy khóa học phù hợp.<br />Hãy thử điều chỉnh bộ lọc.</p>
      </div>}
    </div>
  </>
}

export default CourseIndex;