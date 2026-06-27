package com.e_learning.service.impl;

import com.e_learning.common.Const.*;
import com.e_learning.common.Const;
import com.e_learning.dto.*;
import com.e_learning.dto.listener.ActivePhotoRequest;
import com.e_learning.dto.listener.ActiveVideoRequest;
import com.e_learning.dto.listener.RemovePhotoRequest;
import com.e_learning.dto.listener.RemoveVideoRequest;
import com.e_learning.dto.request.CourseCreateOrUpdateRequest;
import com.e_learning.dto.request.LessonCreateOrUpdateRequest;
import com.e_learning.dto.response.CourseResponse;
import com.e_learning.dto.response.PageResponse;
import com.e_learning.entity.*;
import com.e_learning.exception.AppException;
import com.e_learning.exception.ErrorCode;
import com.e_learning.helper.DataUtil;
import com.e_learning.mapper.*;
import com.e_learning.repository.*;
import com.e_learning.service.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.util.Strings;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class CourseServiceImpl extends BaseAuthedService implements CourseService {
    @Autowired
    private TopicRepository topicRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private PhotoService photoService;
    @Autowired
    private TagRepository tagRepository;
    @Autowired
    private CourseMapper courseMapper;
    @Autowired
    private PhotoRepository photoRepository;
    @Autowired
    private TagService tagService;
    @Autowired
    private SectorService sectorService;
    @Autowired
    private SectorRepository sectorRepository;
    @Autowired
    private TopicService topicService;
    @Autowired
    private ChapterRepository chapterRepository;
    @Autowired
    private LessonMapper lessonMapper;
    @Autowired
    private LessonContentVideoMapper lessonContentVideoMapper;
    @Autowired
    private QuestionMapper questionMapper;
    @Autowired
    private AnswerMapper answerMapper;
    @Autowired
    private LessonRepository lessonRepository;
    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Value("${rabbitmq.message-key.remove-video}")
    private String RABBITMQ_REMOVE_VIDEO_MESSAGE_KEY;
    @Value("${rabbitmq.message-key.active-video}")
    private String RABBITMQ_ACTIVE_VIDEO_MESSAGE_KEY;
    @Value("${rabbitmq.message-key.active-photo}")
    private String RABBITMQ_ACTIVE_PHOTO_MESSAGE_KEY;
    @Value("${rabbitmq.message-key.active-client-photo}")
    private String RABBITMQ_ACTIVE_CLIENT_PHOTO_MESSAGE_KEY;
    @Value("${rabbitmq.message-key.remove-client-photo}")
    private String RABBITMQ_REMOVE_CLIENT_PHOTO_MESSAGE_KEY;
    @Autowired
    private ChapterMapper chapterMapper;
    @Autowired
    private PhotoMapper photoMapper;
    @Autowired
    private VideoMapper videoMapper;
    @Autowired
    private CourseSubscribeRepository courseSubscribeRepository;
    @Autowired
    private UserCertificateRepository userCertificateRepository;
    @Autowired
    private CourseSubscribeMapper courseSubscribeMapper;

    @Override
    public List<CourseResponse> search(String key) {
        var lst = courseRepository.searchAllActive(key);
        return DataUtil.isNullOrEmpty(lst) ? new ArrayList<>() :
            lst.stream().map(this::buildDetail).toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createOrUpdateCourse(CourseCreateOrUpdateRequest request) {
        User user = getCurrentUser();
        if (!checkUserWithRole(user, Role.ADMIN))
            throw new AppException(ErrorCode.UNAUTHORIZED);

        var isCreate = request.getId() == null;

        validate(request);
        List<Course> suggestCourseExisted = null;
        if (!DataUtil.isNullOrEmpty(request.getSuggestCourses())) {
            suggestCourseExisted = courseRepository.findAllByStatusAndIdIn(Const.STATUS_ACTIVE, request.getSuggestCourses());
            if (suggestCourseExisted.size() != request.getSuggestCourses().size()) {
                Set<String> courseExisted = suggestCourseExisted.stream().map(Course::getId).collect(Collectors.toSet());
                List<String> notExists = request.getSuggestCourses().stream().filter(courseId -> !courseExisted.contains(courseId)).toList();
                throw new RuntimeException("Course " + String.join(", ", notExists) + " not exists");
            }
        }

        Course course = new Course();
        if (!isCreate)
            course = courseRepository.findByIdAndStatus(request.getId(), Const.STATUS_ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_EXIST));

        CourseSector sector = null;
        CourseTopic topic = null;
        if (!Strings.isBlank(request.getSectorId()) && !Strings.isBlank(request.getTopicId())) {
            topic = topicRepository.findActiveByTopicIdAndSectorId(request.getTopicId(), request.getSectorId())
                    .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_EXIST));
        } else {
            if (Strings.isBlank(request.getSectorId())) {
                sector = sectorService.create(request.getNewSectorName());
            }
            else
                sector = sectorRepository.findByStatusAndId(Const.STATUS_ACTIVE, request.getSectorId())
                    .orElseThrow(() -> new RuntimeException("Sector not exists"));

            if (Strings.isBlank(request.getSectorId()) || Strings.isBlank(request.getTopicId()))
                topic = topicService.create(request.getNewTopicName(), sector);
            else
                topic = topicRepository.findActiveByTopicIdAndSectorId(request.getTopicId(), sector.getId())
                    .orElseThrow(() -> new RuntimeException("Topic not exists"));
        }

        Photo newThumbnail = null;
        String accessToken = getAccessToken();
        Photo oldPhoto = course.getThumbnail();
        if (isCreate || oldPhoto == null || !DataUtil.equals(request.getThumbnailId(), oldPhoto.getId())) {
            try {
                newThumbnail = photoService.activePhoto(List.of(request.getThumbnailId()), accessToken).get(0);
            } catch (Exception e) {
                log.error("Error active photo: {}", e.getMessage());
            }
        }
        if (newThumbnail == null && !Strings.isBlank(request.getThumbnailId())) {
            newThumbnail = oldPhoto;
            oldPhoto = null;
        }

        List<CourseTag> tags = new ArrayList<>();
        List<CourseTag> lstRequiredKnowledge = new ArrayList<>();
        if (!DataUtil.isNullOrEmpty(request.getTags()))
            tags.addAll(tagService.getOrCreateAll(new HashSet<>(request.getTags())));
        if (!DataUtil.isNullOrEmpty(request.getLstRequiredKnowledge()))
            lstRequiredKnowledge.addAll(tagService.getOrCreateAll(new HashSet<>(request.getLstRequiredKnowledge())));

        courseMapper.update(course, request);
        course.setTopic(topic);
        course.setThumbnail(newThumbnail);
        course.setTags(tags);
        course.setLstRequiredKnowledge(lstRequiredKnowledge);
        course.setSuggestCourses(suggestCourseExisted);

        courseRepository.save(course);

        if (oldPhoto != null) {
            try {
                photoService.removePhoto(List.of(oldPhoto));
            } catch (Exception e) {
                log.error("Error remove photo: {}", e.getMessage());
            }
        }
    }

    private void validate(CourseCreateOrUpdateRequest request) {
        if (Strings.isBlank(request.getNewSectorName()) && Strings.isBlank(request.getSectorId()))
            throw new RuntimeException("Sector is required");

        if (Strings.isBlank(request.getNewTopicName()) && Strings.isBlank(request.getTopicId()))
            throw new RuntimeException("Topic is required");

        // validate tags
        Set<String> singleTagNameRequest = new HashSet<>();
        if (!DataUtil.isNullOrEmpty(request.getTags()))
            for (String tagName : request.getTags())
                if (singleTagNameRequest.contains(tagName))
                    throw new RuntimeException("Duplicate keyword");
                else
                    singleTagNameRequest.add(tagName);

        // validate required knowledge
        Set<String> singleRequiredKnowledge = new HashSet<>();
        if (!DataUtil.isNullOrEmpty(request.getLstRequiredKnowledge()))
            for (String requiredKnowledge : request.getLstRequiredKnowledge())
                if (singleRequiredKnowledge.contains(requiredKnowledge))
                    throw new RuntimeException("Duplicate required knowledge");
                else
                    singleRequiredKnowledge.add(requiredKnowledge);

        // validate suggest course
        Set<String> singleSuggestCourse = new HashSet<>();
        if (!DataUtil.isNullOrEmpty(request.getSuggestCourses()))
            for (String suggestCourse : request.getSuggestCourses())
                if (singleSuggestCourse.contains(suggestCourse))
                    throw new RuntimeException("Duplicate suggest course");
                else
                    singleSuggestCourse.add(suggestCourse);

        if (CourseType.PAID.equals(request.getType())) {
            if (request.getPrice() == null)
                throw new RuntimeException("Course price is required");
        } else
            request.setPrice(null);

        if (CourseType.PAID.equals(request.getType()) && request.getPromotionType() != null) {
            if (request.getPromotion() == null || request.getPromotion() < 0)
                throw new RuntimeException("promotion is required");
            if (PromotionType.MONEY.equals(request.getPromotionType()) &&
                request.getPromotion() > request.getPrice())
                throw new RuntimeException("promotion cannot bigger than price");
            else if (PromotionType.PERCENT.equals(request.getPromotionType()) &&
                request.getPromotion() > 100)
                throw new RuntimeException("promotion maximum 100%");
        } else {
            request.setPromotion(null);
            request.setPromotionType(null);
        }

        if (DataUtil.boolValue(request.getIssuingCertificate())) {
            if (Strings.isBlank(request.getTemplateCertificate()))
                throw new RuntimeException("template certificate cannot be empty");
        } else
            request.setTemplateCertificate(null);

        if (Strings.isBlank(request.getCode()))
            throw new RuntimeException("course code is required");
        else if (!DataUtil.isAllNumberOrLatin(request.getCode()))
            throw new RuntimeException("course code only has number or latin");
        else if (request.getCode().length() > 30)
            throw new RuntimeException("course code max length 30");

        Course existed = courseRepository.getActiveByCodeOrNameAndTopicId(request.getCode(), request.getName(), request.getTopicId());
        if (existed != null && !DataUtil.equals(request.getId(), existed.getId())) {
            if (DataUtil.equals(existed.getCode(), request.getCode()))
                throw new RuntimeException("Course code already existed");
            else if (DataUtil.equals(existed.getName(), request.getName()))
                throw new RuntimeException("Course name already existed");
        }
    }

    @Override
    public PageResponse<CourseResponse> searchLimit(String key, String sectorId, String topicId, CourseDifficult difficult, CourseLanguage language,  CourseType type, Double priceFrom, Double priceTo, Course.COLUMNS orderBy, Sort.Direction orderMode, Integer pageNumber, Integer pageSize) {
        String userId = getCurrentUserId();
        pageNumber = pageNumber == null || pageNumber < 1 ? 1 : pageNumber;
        pageSize = pageSize == null || pageSize < 1 ? 10 : pageSize;
        orderMode = orderMode == null ? Sort.Direction.ASC : orderMode;
        orderBy = orderBy == null ? Course.COLUMNS.CREATED_TIME : orderBy;

        Pageable pageable = PageRequest.of(
            pageNumber - 1,
            pageSize,
            Sort.by(orderMode, orderBy.name().toLowerCase())
        );

        Page<Course> coursePage = courseRepository.searchLimitActive(key, sectorId, topicId,
                difficult == null ? null : difficult.name(),
                language == null ? null : language.name(),
                type == null ? null : type.name(),
                priceFrom, priceTo, pageable);

        coursePage.getContent();

        List<CourseSubscribe> mySubscribes = courseSubscribeRepository.findAllByUserIdAndStatus(userId, Const.STATUS_ACTIVE);
        Map<String, CourseSubscribe> mapIdSub = new HashMap<>();
        DataUtil.defaultIfNull(mySubscribes, new ArrayList<CourseSubscribe>())
            .forEach(sub -> mapIdSub.put(sub.getCourse().getId(), sub));
        List<CourseResponse> lst = coursePage.getContent().stream().map(course -> {
            CourseResponse courseRes = this.buildDetail(course);
            if (courseRes == null) return courseRes;
            CourseSubscribe subscribe = mapIdSub.get(course.getId());
            if (subscribe != null)
                courseRes.setSubscribe(courseSubscribeMapper.toDTO(subscribe));
            return courseRes;
        }).toList();
        return PageResponse.<CourseResponse>builder()
            .totalPage(coursePage.getTotalPages())
            .totalRecord(coursePage.getTotalElements())
            .pageNumber(pageNumber)
            .pageSize(pageSize)
            .list(lst)
            .build();
    }

    @Override
    public Long count() {
        return courseRepository.countActive();
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public void remove(List<String> ids) {
        User user = getCurrentUser();
        if (!checkUserWithRole(user, Role.ADMIN))
            throw new AppException(ErrorCode.UNAUTHORIZED);
        if (DataUtil.isNullOrEmpty(ids)) return;
        List<Course> courses = courseRepository.findAllByStatusAndIdIn(Const.STATUS_ACTIVE, ids);
        if (DataUtil.isNullOrEmpty(courses)) return;
        List<Photo> photos = new ArrayList<>();
        courses.forEach(course -> {
            course.setTags(null);
            course.setLstRequiredKnowledge(null);
            course.setSuggestCourses(null);
            if (course.getThumbnail() != null) {
                photos.add(course.getThumbnail());
                course.setThumbnail(null);
            }
            course.setStatus(Const.STATUS_INACTIVE);
        });
        courseRepository.saveAll(courses);
        photoService.removePhoto(photos);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public List<ChapterDTO> createOrUpdateLessons(LessonCreateOrUpdateRequest request) {
        User user = getCurrentUser();
        if (!checkUserWithRole(user, Role.ADMIN))
            throw new AppException(ErrorCode.UNAUTHORIZED);
        Course course = courseRepository.findByIdAndStatus(request.getCourseId(), Const.STATUS_ACTIVE)
            .orElseThrow(() -> new RuntimeException("Course not exists"));

        // validate
        validate(request.getChapters());
        Set<String> singlePhotoIdRequest = new HashSet<>();
        request.getChapters().forEach(chapter -> {
            chapter.getLessons().forEach(lesson -> {
                if (LessonType.ARTICLE.equals(lesson.getType()))
                    DataUtil.defaultIfNull(lesson.getArticle().getPhotos(), new ArrayList<PhotoDTO>())
                        .forEach(photoDTO -> singlePhotoIdRequest.add(photoDTO.getId()));
                else if (LessonType.TEST.equals(lesson.getType()))
                    DataUtil.defaultIfNull(lesson.getTest().getQuestions(), new ArrayList<QuestionDTO>())
                        .forEach(questionDTO -> DataUtil.defaultIfNull(questionDTO.getPhotos(), new ArrayList<PhotoDTO>())
                            .forEach(photoDTO -> singlePhotoIdRequest.add(photoDTO.getId())));
            });
        });

        List<Photo> realPhotos = DataUtil.isNullOrEmpty(singlePhotoIdRequest) ? new ArrayList<>() :
            photoRepository.findAllByStatusAndIdIn(Const.STATUS_ACTIVE, singlePhotoIdRequest.stream().toList());
        Map<String, Lesson> mapIdLesson = new HashMap<>();
        Map<String, LessonChapter> mapIdChapter = new HashMap<>();
        Map<String, Photo> mapIdRealPhoto  = new HashMap<>();
        Set<String> removePhotos = new HashSet<>();
        realPhotos.forEach(photo -> mapIdRealPhoto.putIfAbsent(photo.getId(), photo));

        List<LessonChapter> oldChapters = DataUtil.defaultIfNull(chapterRepository.findAllByStatusAndCourseId(Const.STATUS_ACTIVE, course.getId()), new ArrayList<>());
        oldChapters.forEach(oldChapter -> {
            mapIdChapter.put(oldChapter.getId(), oldChapter);
            if (DataUtil.isNullOrEmpty(oldChapter.getLessons()))
                return;
            oldChapter.getLessons().forEach(lesson -> {
                mapIdLesson.put(lesson.getId(), lesson);
                if (lesson.getContent() instanceof LessonContentArticle) {
                    List<Photo> photos = ((LessonContentArticle) lesson.getContent()).getPhotos();
                    if (DataUtil.isNullOrEmpty(photos)) return;
                    photos.forEach(photo -> removePhotos.add(photo.getId()));
                } else if (lesson.getContent() instanceof LessonContentTest) {
                    List<Question> questions = ((LessonContentTest) lesson.getContent()).getQuestions();
                    if (DataUtil.isNullOrEmpty(questions)) return;
                    questions.forEach(question -> {
                        List<Photo> photos = question.getPhotos();
                        if (DataUtil.isNullOrEmpty(photos)) return;
                        photos.forEach(photo -> removePhotos.add(photo.getId()));
                    });
                }
            });
        });

        Set<String> removeVideos = new HashSet<>();
        Set<String> activeVideos = new HashSet<>();
        Map<String, Photo> usePhotos = new HashMap<>();
        LocalDateTime now = DataUtil.now();

        List<LessonChapter> newChapters = new ArrayList<>();
        for (int indexC = 0; indexC < request.getChapters().size(); indexC++) {
            ChapterDTO chapterDTO = request.getChapters().get(indexC);
            LessonChapter chapter = mapIdChapter.get(chapterDTO.getId());
            int totalTime = 0;
            if (chapter == null) {
                chapter = new LessonChapter();
            } else {
                mapIdChapter.remove(chapterDTO.getId());
            }
            chapter.setName(chapterDTO.getName());
            chapter.setCourse(course);
            chapter.setNumber(indexC + 1);

            List<Lesson> lessons = new ArrayList<>();
            for (int indexL = 0; indexL < chapterDTO.getLessons().size(); indexL++) {
                LessonDTO lessonDTO = chapterDTO.getLessons().get(indexL);
                Lesson lesson = mapIdLesson.get(lessonDTO.getId());
                if (lesson == null) {
                    lesson = new Lesson();
                } else {
                    mapIdLesson.remove(lessonDTO.getId());
                }
                LessonContent oldContent = lesson.getContent();
                if (!DataUtil.equals(lesson.getType(), lessonDTO.getType()) &&
                        LessonType.VIDEO.equals(lesson.getType()) &&
                        oldContent instanceof LessonContentVideo
                ) {
                    removeVideos.add(((LessonContentVideo) oldContent).getVideoInfo().getId());
                }
                lessonMapper.update(lesson, lessonDTO);
                LessonContent content = lesson.getContent();
                if (LessonType.ARTICLE.equals(lesson.getType())) {
                    if (!(content instanceof LessonContentArticle))
                        content = new LessonContentArticle();
                    ((LessonContentArticle) content).setContent(lessonDTO.getArticle().getContent());
                    ((LessonContentArticle) content).setPhotos(consistentPhotos(lessonDTO.getArticle().getPhotos(), mapIdRealPhoto, usePhotos));
                } else if (LessonType.VIDEO.equals(lesson.getType())) {
                    Video newVideo = videoMapper.toEntity(lessonDTO.getVideo().getVideoInfo());
                    if (!(content instanceof LessonContentVideo)) {
                        content = new LessonContentVideo();
                    }
                    else {
                        Video oldVideo = ((LessonContentVideo) content).getVideoInfo();
                        if (!DataUtil.equals(oldVideo.getId(), newVideo.getId())) {
                            removeVideos.add(oldVideo.getId());
                        } else
                            newVideo = oldVideo;
                    }
                    lessonContentVideoMapper.update((LessonContentVideo) content, lessonDTO.getVideo());
                    if (!DataUtil.boolValue(newVideo.getIsActive())) {
                        activeVideos.add(newVideo.getId());
                        newVideo.setIsActive(true);
                    }
                    ((LessonContentVideo) content).setVideoInfo((newVideo));
                    lesson.setDuration((int) Math.ceil(newVideo.getDuration() / 60.0));
                } else if (LessonType.TEST.equals(lesson.getType())) {
                    if (!(content instanceof LessonContentTest)) {
                        content = new LessonContentTest();
                    }
                    List<Question> questions = ((LessonContentTest) content).getQuestions();
                    if (questions == null) {
                        questions = new ArrayList<>();
                        ((LessonContentTest) content).setQuestions(questions);
                    } else
                        questions.clear();
                    double totalScore = 0;
                    for (int indexQ = 0; indexQ < lessonDTO.getTest().getQuestions().size(); indexQ++) {
                        QuestionDTO questionDTO = lessonDTO.getTest().getQuestions().get(indexQ);
                        Question newQuestion = new Question();
                        questionMapper.update(newQuestion, questionDTO);
                        newQuestion.setTest((LessonContentTest) content);
                        newQuestion.setNumber(indexQ + 1);
                        newQuestion.setPhotos(consistentPhotos(questionDTO.getPhotos(), mapIdRealPhoto, usePhotos));
                        totalScore += newQuestion.getScore();
                        if (!DataUtil.isNullOrEmpty(questionDTO.getAnswers())) {
                            List<QuestionAnswer> answers = new ArrayList<>();
                            newQuestion.setAnswers(answers);
                            for (int indexA = 0; indexA < questionDTO.getAnswers().size(); indexA++) {
                                AnswerDTO dto = questionDTO.getAnswers().get(indexA);
                                QuestionAnswer answer = answerMapper.toEntity(dto);
                                answer.setQuestion(newQuestion);
                                answer.setNumber(indexA + 1);
                                answers.add(answer);
                            }
                        }
                        questions.add(newQuestion);
                    }
                    lesson.setTotalScore(totalScore);
                }
                content.setLesson(lesson);
                lesson.setContent(content);
                lesson.setChapter(chapter);
                lesson.setNumber(indexL + 1);
                totalTime += DataUtil.defaultIfNull(lesson.getDuration(), 0);
                lessons.add(lesson);
            }
            chapter.setLessons(lessons);
            chapter.setTotalTime(totalTime);
            newChapters.add(chapter);
        }
        List<String> activePhotos = new ArrayList<>();
        List<Photo> addPhotos = new ArrayList<>();
        usePhotos.forEach((usePhotoId, usePhoto) -> {
            removePhotos.remove(usePhotoId);
            if (mapIdRealPhoto.containsKey(usePhotoId)) return;
            if (!DataUtil.boolValue(usePhoto.getIsActive())) {
                usePhoto.setIsActive(true);
                activePhotos.add(usePhotoId);
            }
            addPhotos.add(usePhoto);
        });
        if (!addPhotos.isEmpty()) {
            photoService.saveIfNotExist(addPhotos);
        }
        if (!mapIdLesson.isEmpty()) {
            lessonRepository.deleteAll(mapIdLesson.values().stream().peek(lesson -> {
                if (lesson.getContent() instanceof LessonContentVideo)
                    try {
                        removeVideos.add(((LessonContentVideo) lesson.getContent()).getVideoInfo().getId());
                    } catch (Exception ignored) {}
            }).toList());
        }
        if (!mapIdChapter.isEmpty()) {
            chapterRepository.deleteAll(mapIdChapter.values());
        }
        newChapters = chapterRepository.saveAll(newChapters);

        // chạy sau khi đã xong transaction
        TransactionSynchronizationManager.registerSynchronization(
            new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    if (!removePhotos.isEmpty()) {
                        rabbitTemplate.convertAndSend(
                            RABBITMQ_REMOVE_CLIENT_PHOTO_MESSAGE_KEY,
                            new RemovePhotoRequest(new ArrayList<>(removePhotos))
                        );
                    }

                    if (!activePhotos.isEmpty()) {
                        rabbitTemplate.convertAndSend(
                            RABBITMQ_ACTIVE_CLIENT_PHOTO_MESSAGE_KEY,
                            new ActivePhotoRequest(new ArrayList<>(activePhotos))
                        );
                    }

                    if (!removeVideos.isEmpty()) {
                        rabbitTemplate.convertAndSend(
                            RABBITMQ_REMOVE_VIDEO_MESSAGE_KEY,
                            new RemoveVideoRequest(new ArrayList<>(removeVideos))
                        );
                    }

                    if (!activeVideos.isEmpty()) {
                        rabbitTemplate.convertAndSend(
                            RABBITMQ_ACTIVE_VIDEO_MESSAGE_KEY,
                            new ActiveVideoRequest(new ArrayList<>(activeVideos))
                        );
                    }
                }
            }
        );

        List<ChapterDTO> chapterDTOS = newChapters.stream().map(chapter -> {
            ChapterDTO chapterDTO = chapterMapper.toDTO(chapter);
            chapterDTO.setLessons(lessonMapper.toLstDTO(chapter.getLessons()));
            return chapterDTO;
        }).toList();
        return chapterDTOS;
    }

    private void validate(List<ChapterDTO> chapters) {
        if (DataUtil.isNullOrEmpty(chapters))
            throw new RuntimeException("Chapter list cannot be empty");
        Set<String> singleChapterName = new HashSet<>();
        for (ChapterDTO chapter : chapters) {
            String chapterName = chapter.getName();
            if (singleChapterName.contains(chapterName))
                throw new RuntimeException("Chapter name " + chapterName + " duplicate");
            singleChapterName.add(chapterName);
            Set<String> singleLessonName = new HashSet<>();
            for (LessonDTO lesson : chapter.getLessons()) {
                String lessonName = lesson.getName();
                if (singleLessonName.contains(lessonName))
                    throw new RuntimeException("Lesson name " + lessonName + " duplicate in chapter " + chapterName);
                singleLessonName.add(lessonName);
                if (!LessonType.VIDEO.equals(lesson.getType())) {
                    if (lesson.getDuration() == null)
                        throw new RuntimeException("Duration is required");
                }
                if (LessonType.ARTICLE.equals(lesson.getType())) {
                    if (lesson.getArticle() == null)
                        throw new RuntimeException("Article is required");
                } else if (LessonType.VIDEO.equals(lesson.getType())) {
                    if (lesson.getVideo() == null)
                        throw new RuntimeException("Video is required");
                    if (lesson.getVideo().getQualityDefault() > lesson.getVideo().getVideoInfo().getQuality())
                        throw new RuntimeException("Quality default invalid");
                } else if (LessonType.TEST.equals(lesson.getType())) {
                    ContentTestDTO test = lesson.getTest();
                    if (test == null)
                        throw new RuntimeException("Test is required");
                    if (lesson.getPassScore() == null)
                        throw new RuntimeException("Pass score is required");
                    if (lesson.getScoringMode() == null)
                        throw new RuntimeException("Scoring mode is required");
                    double totalScore = 0;
                    for (QuestionDTO question : test.getQuestions()) {
                        totalScore += question.getScore();
                        if (QuestionType.ARGUMENT.equals(question.getType())) {
                            if (Strings.isBlank(question.getAnswer()))
                                throw new RuntimeException("Answer is required");
                        } else if (QuestionType.CHOICE.equals(question.getType()) || QuestionType.MULTI_CHOICE.equals(question.getType())) {
                            if (DataUtil.isNullOrEmpty(question.getAnswers()) || question.getAnswers().size() < 2)
                                throw new RuntimeException("Minimum 2 answers");
                            long correctCount = question.getAnswers()
                                    .stream()
                                    .filter(answer -> DataUtil.boolValue(answer.getIsCorrect()))
                                    .count();

                            if (correctCount == 0)
                                throw new RuntimeException("Minimum 1 answer correct");

                            if (QuestionType.CHOICE.equals(question.getType()) && correctCount > 1)
                                throw new RuntimeException("Maximum 1 answer correct");
                        }
                    }
                    if (lesson.getPassScore() > totalScore)
                        throw new RuntimeException("Pass score is bigger total score");
                }
            }
        }
    }
    
    private List<Photo> consistentPhotos(List<PhotoDTO> photoDTOS, Map<String, Photo> mapIdRealPhoto, Map<String, Photo> usePhotos) {
        if (DataUtil.isNullOrEmpty(photoDTOS)) return new ArrayList<>();
        Set<String> singlePhotoId = new HashSet<>();
        List<Photo> photos = new ArrayList<>();
        for (PhotoDTO photoDTO : photoDTOS) {
            if (singlePhotoId.contains(photoDTO.getId())) continue;
            Photo photo = null;
            if (mapIdRealPhoto.containsKey(photoDTO.getId())) {
                photo = mapIdRealPhoto.get(photoDTO.getId());
            } else if (usePhotos.containsKey(photoDTO.getId())){
                photo = usePhotos.get(photoDTO.getId());
            } else
                photo = photoMapper.toEntity(photoDTO);
            singlePhotoId.add(photoDTO.getId());
            usePhotos.putIfAbsent(photoDTO.getId(), photo);
            photos.add(photo);
        }
        return photos;
    }

    @Override
    public CourseResponse getDetailById(String courseId) {
        User user = getCurrentUser();
        var course = courseRepository.findByIdAndStatus(courseId, Const.STATUS_ACTIVE)
                .orElseThrow(() -> new RuntimeException("Course not exists"));
        CourseResponse response = buildDetail(course);
        if (response == null) return null;
        var subscribe = DataUtil.defaultIfNull(course.getSubscribes(), new ArrayList<CourseSubscribe>())
                .stream().filter(sub -> DataUtil.equals(user.getId(), sub.getUser().getId()))
                .findAny();
        var isAdmin = checkUserWithRole(user, Role.ADMIN);
        if (isAdmin || subscribe.isPresent()) {
            response.setChapters(course.getChapters().stream().map(chapter -> {
                ChapterDTO chapterDTO = chapterMapper.toDTO(chapter);
                chapterDTO.setLessons(isAdmin ?
                        lessonMapper.toLstDTO(chapter.getLessons()) :
                        lessonMapper.toLstDTOClient(chapter.getLessons()));
                return chapterDTO;
            }).toList());
        }
        subscribe.ifPresent(courseSubscribe ->
                response.setSubscribe(courseSubscribeMapper.toDTO(courseSubscribe)));
        return response;
    }

    @Override
    public CourseResponse getById(String courseId) {
        var course = courseRepository.findByIdAndStatus(courseId, Const.STATUS_ACTIVE)
            .orElseThrow(() -> new RuntimeException("Course not exists"));
        return courseMapper.toResponse(course);
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public SubscribeDTO subscribeCourse(SubscribeDTO request, User user) {
        if (user == null)
            user = getCurrentUser();
        if (request == null || Strings.isBlank(request.getCourseId()))
            throw new RuntimeException("courseId is required");
        var courseCheck = courseRepository.findByIdAndStatus(request.getCourseId(), Const.STATUS_ACTIVE);
        if (courseCheck.isEmpty())
            throw new RuntimeException("Course not exists");
        if (courseSubscribeRepository
            .existsByUserIdAndCourseIdAndStatus(user.getId(), request.getCourseId(), Const.STATUS_ACTIVE))
            throw new RuntimeException("Course subscribed");
        CourseSubscribe newSubscribe = CourseSubscribe.builder()
            .user(user)
            .course(courseCheck.get())
            .build();
        courseSubscribeRepository.save(newSubscribe);
        return courseSubscribeMapper.toDTO(newSubscribe);
    }

    @Override
    public Long countMyCourses() {
        return (long) courseSubscribeRepository.countByUserIdAndStatus(getCurrentUserId(), Const.STATUS_ACTIVE);
    }

    @Override
    public Long countMyCertificates() {
        return (long) userCertificateRepository.countByUserIdAndStatus(getCurrentUserId(), Const.STATUS_ACTIVE);
    }

    private CourseResponse buildDetail(Course course) {
        CourseResponse response = courseMapper.toResponse(course);
        if (response == null) return null;
        int countLesson = 0, totalTime = 0;
        for (LessonChapter chapter : course.getChapters()) {
            if (chapter == null) continue;
            countLesson += DataUtil.defaultIfNull(chapter.getLessons(), new ArrayList<>()).size();
            totalTime += DataUtil.defaultIfNull(chapter.getTotalTime(), 0);
        }
        response.setCountLesson(countLesson);
        response.setTotalTime(totalTime);
        return response;
    }
}
