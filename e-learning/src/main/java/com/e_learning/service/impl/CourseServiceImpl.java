package com.e_learning.service.impl;

import com.e_learning.common.Const;
import com.e_learning.dto.request.CourseCertificateRequest;
import com.e_learning.dto.request.CourseCreateOrUpdateRequest;
import com.e_learning.entity.*;
import com.e_learning.exception.AppException;
import com.e_learning.exception.ErrorCode;
import com.e_learning.helper.DataUtil;
import com.e_learning.helper.ValidatorUtil;
import com.e_learning.mapper.CourseCertificateMapper;
import com.e_learning.mapper.CourseMapper;
import com.e_learning.repository.*;
import com.e_learning.service.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.util.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private CourseCertificateMapper courseCertificateMapper;
    @Autowired
    private CourseCertificateRepository courseCertificateRepository;
    @Autowired
    private PhotoRepository photoRepository;
    @Autowired
    private TagService tagService;
    @Autowired
    private SectorService sectorService;
    @Autowired
    private SectorRepository sectorRepository;
    @Autowired
    private CourseCertificateService courseCertificateService;
    @Autowired
    private TopicService topicService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createOrUpdateCourse(CourseCreateOrUpdateRequest request) {
        var isCreate = request.getId() == null;

        validate(request);
        List<Course> suggestCourseExisted = null;
        if (!DataUtil.isNullOrEmpty(request.getLstSuggestCourse())) {
            suggestCourseExisted = courseRepository.findAllByStatusAndIdIn(Const.STATUS_ACTIVE, request.getLstSuggestCourse());
            if (suggestCourseExisted.size() != request.getLstSuggestCourse().size()) {
                Set<String> courseExisted = suggestCourseExisted.stream().map(Course::getId).collect(Collectors.toSet());
                List<String> notExists = request.getLstSuggestCourse().stream().filter(courseId -> !courseExisted.contains(courseId)).toList();
                throw new RuntimeException("Course " + String.join(", ", notExists) + " not exists");
            }
        }

        CourseCertificate certificate = null;
        if (DataUtil.boolValue(request.getIssuingCertificate()))
            certificate = courseCertificateService.createOrUpdate(request.getCertificate());

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
                newThumbnail = photoService.active(List.of(request.getThumbnailId()), accessToken).get(0);
            } catch (Exception e) {
                log.error("Error active photo: {}", e.getMessage());
                e.printStackTrace();
            }
        }

        if (oldPhoto != null) {
            try {
                photoService.removePhoto(List.of(oldPhoto), accessToken);
            } catch (Exception e) {
                log.error("Error remove photo: {}", e.getMessage());
                e.printStackTrace();
            }
        }

        List<CourseTag> tags = tagService.getOrCreateAll(new HashSet<>(request.getLstTagName()));
        List<CourseTag> requiredKnowledge = tagService.getOrCreateAll(new HashSet<>(request.getLstRequiredKnowledge()));

        courseMapper.update(course, request);
        course.setTopic(topic);
        course.setThumbnail(newThumbnail);
        course.setTags(tags);
        course.setCertificate(certificate);
        course.setTags(tags);
        course.setLstRequiredKnowledge(requiredKnowledge);
        course.setSuggestCourses(suggestCourseExisted);

        courseRepository.save(course);
    }

    private void validate(CourseCreateOrUpdateRequest request) {
        if (Strings.isBlank(request.getNewSectorName()) && Strings.isBlank(request.getSectorId()))
            throw new RuntimeException("Sector is required");

        if (Strings.isBlank(request.getNewTopicName()) && Strings.isBlank(request.getTopicId()))
            throw new RuntimeException("Topic is required");

        // validate tags
        Set<String> singleTagNameRequest = new HashSet<>();
        if (!DataUtil.isNullOrEmpty(request.getLstTagName()))
            for (String tagName : request.getLstTagName())
                if (singleTagNameRequest.contains(tagName))
                    throw new RuntimeException("Duplicate tag name");
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
        if (!DataUtil.isNullOrEmpty(request.getLstSuggestCourse()))
            for (String suggestCourse : request.getLstSuggestCourse())
                if (singleSuggestCourse.contains(suggestCourse))
                    throw new RuntimeException("Duplicate suggest course");
                else
                    singleSuggestCourse.add(suggestCourse);

        if (CourseType.PAID.equals(request.getType())) {
            if (request.getPrice() == null)
                throw new RuntimeException("Course price is required");
            else if (request.getPrice() < 0)
                throw new RuntimeException("Course price minimum 0");
        }
    }
}
