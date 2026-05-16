package com.e_learning.mapper;

import com.e_learning.entity.CourseTag;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TagMapper {
    default String toTagStr(CourseTag tag) {
        if (tag == null) return null;
        return tag.getName();
    }

    default List<String> toLstTagStr(List<CourseTag> tags) {
        if (tags == null) return null;
        return tags.stream().map(this::toTagStr).toList();
    }
}
