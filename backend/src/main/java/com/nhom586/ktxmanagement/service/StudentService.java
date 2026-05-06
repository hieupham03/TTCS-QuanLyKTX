package com.nhom586.ktxmanagement.service;


import com.nhom586.ktxmanagement.dto.request.StudentUpdateRequest;
import com.nhom586.ktxmanagement.entity.Student;
import com.nhom586.ktxmanagement.mapper.StudentMapper;
import com.nhom586.ktxmanagement.repository.StudentRepository;
import com.nhom586.ktxmanagement.repository.AccountRepository;
import com.nhom586.ktxmanagement.dto.request.StudentCreationRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StudentService {
    StudentRepository studentRepository;
    AccountRepository accountRepository;
    StudentMapper studentMapper;

    public Student createStudent(StudentCreationRequest request) {

        Optional<Student> existingStudent = studentRepository.findById(request.getStudentCode());
        if(existingStudent.isPresent()){
            Student student = existingStudent.get();
           // nếu sinh viên đã có tài khoản thì cập nhật lại thông tin
            if(student.getAccount() != null) {
                studentMapper.updateStudentFromCreateRequest(student, request);
                return studentRepository.save(student);
            }
            else {
               throw new RuntimeException("Mã sinh viên đã tồn tại"); 
            }
        }

        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        if (studentRepository.existsByCccd(request.getCccd())) {
            throw new RuntimeException("CCCD đã tồn tại");
        }
        Student newStudent = studentMapper.toStudent(request);
        return studentRepository.save(newStudent);
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

    // Xoá sinh viên thì xoá tài khoản
    public void  deleteStudent (String studentCode) {
        Student student = getStudent(studentCode);
        if (student.getAccount() != null) {
            student.getAccount().setIsActive(false);
            accountRepository.deleteById(student.getAccount().getId());
        }
        studentRepository.deleteById(studentCode);
    }
}
