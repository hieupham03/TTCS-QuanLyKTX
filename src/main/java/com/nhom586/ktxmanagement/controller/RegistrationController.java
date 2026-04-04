package com.nhom586.ktxmanagement.controller;

import com.nhom586.ktxmanagement.dto.request.RegistrationCreationRequest;
import com.nhom586.ktxmanagement.dto.request.RegistrationStatusUpdateRequest;
import com.nhom586.ktxmanagement.entity.Registration;
import com.nhom586.ktxmanagement.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    @GetMapping
    public List<Registration> getAllRegistrations() {
        return registrationService.getAllRegistrations();
    }

    @GetMapping("/{id}")
    public Registration getRegistrationById(@PathVariable("id") Integer id) {
        return registrationService.getRegistrationById(id);
    }

    @GetMapping("/student/{studentCode}")
    public List<Registration> getRegistrationsByStudent(@PathVariable("studentCode") String studentCode) {
        return registrationService.getRegistrationsByStudent(studentCode);
    }

    @PostMapping
    public Registration createRegistration(@RequestBody @Valid RegistrationCreationRequest request) {
        return registrationService.createRegistration(request);
    }

    @PutMapping("/{id}/status")
    public Registration updateRegistrationStatus(@PathVariable("id") Integer id,
            @RequestBody @Valid RegistrationStatusUpdateRequest request) {
        return registrationService.updateRegistrationStatus(id, request);
    }
}