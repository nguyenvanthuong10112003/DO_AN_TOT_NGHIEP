package com.e_learning.service.impl;

import com.e_learning.common.Const;
import com.e_learning.entity.CourseTag;
import com.e_learning.helper.DataUtil;
import com.e_learning.repository.TagRepository;
import com.e_learning.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TagServiceImpl implements TagService {
    @Autowired
    private TagRepository tagRepository;

    @Override
    public List<CourseTag> getOrCreateAll(@NonNull Set<String> tags) {
        if (DataUtil.isNullOrEmpty(tags)) return new ArrayList<>();

        List<CourseTag> entityTags = DataUtil.isNullOrEmpty(tags) ? new ArrayList<>() :
            DataUtil.defaultIfNull(
                tagRepository.findByStatusAndNameIn(Const.STATUS_ACTIVE, tags.stream().toList()),
                new ArrayList<>()
            );

        if (entityTags.size() < tags.size()) {
            Set<String> lstTagExisted = entityTags.stream().map(CourseTag::getName).collect(Collectors.toSet());
            tags.forEach(tagName -> {
                if (lstTagExisted.contains(tagName)) return;
                CourseTag newTag = CourseTag.builder()
                        .name(tagName)
                        .build();
                entityTags.add(newTag);
                lstTagExisted.add(tagName);
            });
        }

        return entityTags;
    }
}
