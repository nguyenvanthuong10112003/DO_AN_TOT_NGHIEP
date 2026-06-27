package com.e_learning.service.impl;

import com.e_learning.common.Const;
import com.e_learning.dto.ContentTestDTO;
import com.e_learning.dto.ProgressDTO;
import com.e_learning.dto.LessonDTO;
import com.e_learning.dto.QuestionHistoryDTO;
import com.e_learning.dto.response.FinishLessonDTO;
import com.e_learning.entity.*;
import com.e_learning.helper.DataUtil;
import com.e_learning.mapper.LessonHistoryMapper;
import com.e_learning.mapper.LessonMapper;
import com.e_learning.repository.LessonHistoryRepository;
import com.e_learning.repository.LessonRepository;
import com.e_learning.service.BaseAuthedService;
import com.e_learning.service.LessonService;
import org.apache.commons.lang3.StringUtils;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LessonServiceImpl extends BaseAuthedService implements LessonService {
    @Autowired
    private LessonRepository lessonRepository;
    @Autowired
    private LessonMapper lessonMapper;
    @Autowired
    private LessonHistoryRepository lessonHistoryRepository;
    @Autowired
    private LessonHistoryMapper lessonHistoryMapper;

    private Lesson getClientEntityById(@NonNull User user, String lessonId, boolean isPreview) {
        String userId = user.getId();
        var lesson = lessonRepository.findByIdAndStatus(lessonId, Const.STATUS_ACTIVE)
                .orElseThrow(() -> new RuntimeException("Lesson not exist"));

        var chapter = lesson.getChapter();
        if (chapter == null || !DataUtil.equals(chapter.getStatus(), Const.STATUS_ACTIVE))
            throw new RuntimeException("Chapter not exist");

        var course = chapter.getCourse();
        if (course == null || !DataUtil.equals(course.getStatus(), Const.STATUS_ACTIVE))
            throw new RuntimeException("Course not exist");

        if (isPreview && DataUtil.boolValue(lesson.getCanPreview()))
            return lesson;

        if (course.getSubscribes().stream()
                .noneMatch(sub -> DataUtil.equals(sub.getUser().getId(), userId)))
            throw new RuntimeException("Course hasn't subscribe");

        List<LessonChapter> chapters = course.getChapters();
        int chapterIndex = chapters.indexOf(chapter);
        for (int ci = chapterIndex; ci >= 0; ci--) {
            LessonChapter currentChapter = chapters.get(ci);
            List<Lesson> currentLessons = currentChapter.getLessons();
            int lessonIndex = ci == chapterIndex
                    ? currentLessons.indexOf(lesson) - 1
                    : currentLessons.size() - 1;
            boolean isBreak = false;
            for (int li = lessonIndex; li >= 0; li--) {
                Lesson previous = currentLessons.get(li);
                if (!DataUtil.boolValue(previous.getRequireFinish())) continue;

                boolean finished = previous.getHistories().stream()
                        .anyMatch(h ->
                                DataUtil.equals(h.getUser().getId(), userId)
                                        && h.getFinishTime() != null);

                if (!finished) {
                    throw new RuntimeException("Need to finish before lesson");
                }

                isBreak = true;
                break;
            }
            if (isBreak) break;
        }
        return lesson;
    }

    @Override
    public LessonDTO getClientById(String lessonId) {
        LessonDTO lesson = lessonMapper.toDTOLite(getClientEntityById(getCurrentUser(), lessonId, true));
        if (!(Const.LessonType.TEST.equals(lesson.getType()) && lesson.getIsMix()))
            return lesson;
        ContentTestDTO testDTO = lesson.getTest();
        if (testDTO == null || DataUtil.isNullOrEmpty(testDTO.getQuestions()))
            return lesson;
        Collections.shuffle(testDTO.getQuestions());
        return lesson;
    }

    @Override
    public ProgressDTO startLearnLesson(String lessonId) {
        User user = getCurrentUser();
        Lesson lesson = getClientEntityById(user, lessonId, false);
        var historyCheck = lesson.getHistories().stream()
            .filter(h -> DataUtil.equals(h.getUser().getId(), user.getId()))
            .findAny();
        if (historyCheck.isPresent())
            return lessonHistoryMapper.toDTO(historyCheck.get());
        var newHistory = LessonProgress
            .builder()
            .user(user)
            .lesson(lesson)
            .build();
        return lessonHistoryMapper.toDTO(lessonHistoryRepository.save(newHistory));
    }

    @Override
    public ProgressDTO finishLearnLesson(Long historyId, FinishLessonDTO dto) {
        String userId = getCurrentUserId();
        LessonProgress history = lessonHistoryRepository
            .findByIdAndUserIdAndStatus(historyId, userId, Const.STATUS_ACTIVE)
            .orElseThrow(() -> new RuntimeException("History not exist"));
        Lesson lesson = history.getLesson();
        LocalDateTime now = DataUtil.now();
        if (Const.LessonType.ARTICLE.equals(lesson.getType())) {
            if (ChronoUnit.DAYS.between(history.getCreatedTime(), now) < 20)
                throw new RuntimeException("Not enough time");
        } else if (Const.LessonType.TEST.equals(lesson.getType())) {
            if (Const.ScoringMode.PER_QUESTION.equals(lesson.getScoringMode())) {
                double totalScore = calculatorScore(lesson, dto.getQuestionHistories());

            }
        }
        return null;
    }

    private double calculatorScore(Lesson lesson, List<QuestionHistoryDTO> questionHistories) {
        if (lesson == null || DataUtil.isNullOrEmpty(questionHistories))
            throw new RuntimeException("Required argument");
        double totalScore = 0;
        if (!(lesson.getContent() instanceof LessonContentTest test)) {
            throw new RuntimeException("Lesson is not a test");
        }
        Map<String, Question> mapIdQuestion = new HashMap<>();
        Map<String, QuestionHistoryDTO> mapQuestionIdHistory = new HashMap<>();
        test.getQuestions().forEach(q -> mapIdQuestion.put(q.getId(), q));
        questionHistories.forEach(qH -> {
            String questionId = qH.getQuestionId();
            if (mapQuestionIdHistory.containsKey(questionId))
                throw new RuntimeException("Duplicate question");
            if (!mapIdQuestion.containsKey(questionId)) return;
            mapQuestionIdHistory.put(questionId, qH);
        });
        if (test.getQuestions().size() != mapQuestionIdHistory.size())
            throw new RuntimeException("Please answer the question completely");
        for (String questionId : mapQuestionIdHistory.keySet()) {
            QuestionHistoryDTO history = mapQuestionIdHistory.get(questionId);
            Question question = mapIdQuestion.get(questionId);
            if (Const.QuestionType.ARGUMENT.equals(question.getType())) {
                if (DataUtil.equals(StringUtils.trimToEmpty(question.getAnswer()), StringUtils.trimToEmpty(history.getAnswer())))
                    totalScore += question.getScore();
                continue;
            }
            List<String> lstAnswerId = Arrays.stream(
                Optional.ofNullable(history.getStrLstAnswerId())
                    .orElse("")
                    .split(",")
            ).map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
            if (DataUtil.hasDuplicate(lstAnswerId))
                throw new RuntimeException("Duplicate answer");
            Set<String> correctAnswers = question.getAnswers().stream()
                .filter(ans -> DataUtil.boolValue(ans.getIsCorrect())).map(QuestionAnswer::getId).collect(Collectors.toSet());
            if (Const.QuestionType.CHOICE.equals(question.getType())) {
                if (lstAnswerId.size() != 1) continue;
                if (correctAnswers.contains(lstAnswerId.get(0)))
                    totalScore += question.getScore();
            } else if (Const.QuestionType.MULTI_CHOICE.equals(question.getType())) {
                if (correctAnswers.equals(new HashSet<>(lstAnswerId))) {
                    totalScore += question.getScore();
                }
            }
        }
        return totalScore;
    }
}
