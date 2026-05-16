package com.e_learning.service.impl;

import com.e_learning.common.Const;
import com.e_learning.entity.CourseTag;
import com.e_learning.helper.DataUtil;
import com.e_learning.mapper.TagMapper;
import com.e_learning.repository.TagRepository;
import com.e_learning.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TagServiceImpl implements TagService {
    @Autowired
    private TagRepository tagRepository;
    @Autowired
    private TagMapper tagMapper;

    @Transactional(rollbackFor = Exception.class)
    @Override
    public List<CourseTag> getOrCreateAll(@NonNull Set<String> tags) {
        if (DataUtil.isNullOrEmpty(tags)) return new ArrayList<>();

        List<CourseTag> entityTags = DataUtil.isNullOrEmpty(tags) ? new ArrayList<>() :
            DataUtil.defaultIfNull(
                tagRepository.findAllByStatusAndNameIn(Const.STATUS_ACTIVE, tags.stream().toList()),
                new ArrayList<>()
            );

        if (entityTags.size() < tags.size()) {
            Set<String> lstTagExisted = entityTags.stream().map(CourseTag::getName).collect(Collectors.toSet());
            List<CourseTag> newEntities = new ArrayList<>();
            tags.forEach(tagName -> {
                if (lstTagExisted.contains(tagName)) return;
                CourseTag newTag = CourseTag.builder()
                        .name(tagName)
                        .build();
                newEntities.add(newTag);
                lstTagExisted.add(tagName);
            });
            entityTags.addAll(tagRepository.saveAll(newEntities));
        }

        return entityTags;
    }

    @Override
    public List<String> search(String key) {
        return tagMapper.toLstTagStr(tagRepository.searchAllActive(key));
    }
}
