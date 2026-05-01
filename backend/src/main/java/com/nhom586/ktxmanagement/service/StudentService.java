package com.nhom586.ktxmanagement.service;


import com.nhom586.ktxmanagement.dto.request.StudentUpdateRequest;
import com.nhom586.ktxmanagement.entity.Student;
import com.nhom586.ktxmanagement.mapper.StudentMapper;
import com.nhom586.ktxmanagement.repository.StudentRepository;
import com.nhom586.ktxmanagement.dto.request.StudentCreationRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StudentService {
    StudentRepository studentRepository;
    StudentMapper studentMapper;

    public Student createStudent (StudentCreationRequest request) {

        Student student = studentMapper.toStudent(request);
        if(studentRepository.existsById(request.getStudentCode())){
            throw new RuntimeException("Mã sinh viên đã tồn tại");
        }

        return studentRepository.save(student);
    }

    public List<Student> getStudents() {
        return studentRepository.findAll();
    }

    public Student getStudent(String studentCode) {
        return studentRepository.findById(studentCode)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public Student updateStudent(String studentCode, StudentUpdateRequest request) {
        Student student = getStudent(studentCode);
        studentMapper.updateStudent(student, request);

        return studentRepository.save(student);
    }

    public void  deleteStudent (String studentCode) {

        studentRepository.deleteById(studentCode);
    }
}
