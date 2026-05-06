package com.nhom586.ktxmanagement.mapper;

import com.nhom586.ktxmanagement.dto.request.StudentUpdateRequest;
import com.nhom586.ktxmanagement.entity.Student;
import com.nhom586.ktxmanagement.dto.request.StudentCreationRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface StudentMapper {
    Student toStudent(StudentCreationRequest request);
    void updateStudent (@MappingTarget Student student, StudentUpdateRequest request);
    @Mapping(target = "studentCode", ignore = true)
    void updateStudentFromCreateRequest(@MappingTarget Student student,
                                        StudentCreationRequest request);
}
