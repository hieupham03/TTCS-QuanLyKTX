package com.nhom586.ktxmanagement.controller;

import com.nhom586.ktxmanagement.entity.Building;
import com.nhom586.ktxmanagement.repository.BuildingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/buildings")
public class BuildingController {

    // Tiêm (Inject) BuildingRepository vào để sử dụng các hàm thao tác DB
    @Autowired
    private BuildingRepository buildingRepository;

    // API lấy danh sách toàn bộ tòa nhà
    @GetMapping
    public List<Building> getAllBuildings() {
        // Hàm findAll() do Spring Boot tự sinh ra, tương đương lệnh SELECT * FROM buildings
        return buildingRepository.findAll();
    }
}