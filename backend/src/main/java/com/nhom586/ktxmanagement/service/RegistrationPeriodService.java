package com.nhom586.ktxmanagement.service;

import com.nhom586.ktxmanagement.dto.request.RegistrationPeriodRequest;
import com.nhom586.ktxmanagement.entity.RegistrationPeriod;
import com.nhom586.ktxmanagement.entity.Student;
import com.nhom586.ktxmanagement.repository.AccountRepository;
import com.nhom586.ktxmanagement.repository.RegistrationPeriodRepository;
import com.nhom586.ktxmanagement.repository.RegistrationRepository;
import com.nhom586.ktxmanagement.repository.StudentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RegistrationPeriodService {

    RegistrationPeriodRepository registrationPeriodRepository;
    StudentRepository studentRepository;
    AccountRepository accountRepository;
    RegistrationRepository registrationRepository;

    public List<RegistrationPeriod> getAllPeriods() {
        return registrationPeriodRepository.findAll();
    }

    public RegistrationPeriod getPeriodById(Integer id) {
        return registrationPeriodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt đăng ký với id: " + id));
    }

    public RegistrationPeriod createPeriod(RegistrationPeriodRequest request) {
        RegistrationPeriod period = new RegistrationPeriod();
        period.setSemester(request.getSemester());
        period.setRegistrationStartDate(request.getRegistrationStartDate());
        period.setRegistrationEndDate(request.getRegistrationEndDate());
        period.setStayStartDate(request.getStayStartDate());
        period.setStayEndDate(request.getStayEndDate());
        period.setStatus(RegistrationPeriod.PeriodStatus.OPEN);
        return registrationPeriodRepository.save(period);
    }

    public RegistrationPeriod updatePeriod(Integer id, RegistrationPeriodRequest request) {
        RegistrationPeriod period = getPeriodById(id);
        period.setSemester(request.getSemester());
        period.setRegistrationStartDate(request.getRegistrationStartDate());
        period.setRegistrationEndDate(request.getRegistrationEndDate());
        period.setStayStartDate(request.getStayStartDate());
        period.setStayEndDate(request.getStayEndDate());
        return registrationPeriodRepository.save(period);
    }

    @Transactional
    public RegistrationPeriod closePeriod(Integer id) {
        RegistrationPeriod period = getPeriodById(id);
        if (period.getStatus() == RegistrationPeriod.PeriodStatus.CLOSED) {
            throw new RuntimeException("Đợt đăng ký này đã được đóng trước đó.");
        }
        period.setStatus(RegistrationPeriod.PeriodStatus.CLOSED);

        // Xoá các đơn đăng ký và sinh viên không có tài khoản (chưa được duyệt)
        registrationRepository.deleteRegistrationsOfStudentsWithoutAccount();
        studentRepository.deleteStudentsWithoutAccount();

        return registrationPeriodRepository.save(period);
    }

    public RegistrationPeriod openPeriod(Integer id) {
        RegistrationPeriod period = getPeriodById(id);
        if (period.getStatus() == RegistrationPeriod.PeriodStatus.OPEN) {
            throw new RuntimeException("Đợt đăng ký này đang mở rồi.");
        }
        period.setStatus(RegistrationPeriod.PeriodStatus.OPEN);
        return registrationPeriodRepository.save(period);
    }

    public void deletePeriod(Integer id) {
        RegistrationPeriod period = getPeriodById(id);
        registrationPeriodRepository.delete(period);
    }
}
