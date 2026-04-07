package com.nhom586.ktxmanagement.controller;


import com.nhom586.ktxmanagement.dto.request.StudentUpdateRequest;
import com.nhom586.ktxmanagement.entity.Student;
import com.nhom586.ktxmanagement.dto.request.StudentCreationRequest;
import com.nhom586.ktxmanagement.service.StudentService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class StudentController {
    StudentService studentService;

    @PostMapping
    Student CreateStudent(@Valid @RequestBody StudentCreationRequest request) {
        System.out.println(studentService);
        return studentService.CreateStudent(request);
    }


    @GetMapping
    List<Student> GetStudents () {
//        var authentication = SecurityContextHolder.getContext().getAuthentication();
//
//        log.info("username: {}", authentication.getName());
//        authentication.getAuthorities().forEach(grantedAuthority -> log.info(grantedAuthority.getAuthority()));

        return studentService.GetStudents();
    }

    @GetMapping("/{studentCode}")
    Student GetStudent (@PathVariable("studentCode") String studentCode){
        return studentService.GetStudent(studentCode);
    }

    @PutMapping("/{studentCode}")
    Student UpdateStudent(@Valid  @PathVariable("studentCode") String studentCode, @RequestBody StudentUpdateRequest request) {
        return studentService.UpdateStudent(studentCode, request);
    }

    @DeleteMapping("/{studentCode}")
    String DeleteStudent(@PathVariable("studentCode") String studentCode) {
        studentService.DeleteStudent(studentCode);
        return "Student has been deleted";
    }
}
