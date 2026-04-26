package com.nhom586.ktxmanagement.controller;

import com.nhom586.ktxmanagement.dto.request.BuildingCreationRequest;
import com.nhom586.ktxmanagement.dto.request.BuildingUpdateRequest;
import com.nhom586.ktxmanagement.entity.Building;
import com.nhom586.ktxmanagement.service.BuildingService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BuildingController {

    BuildingService buildingService;

    // API lấy danh sách toàn bộ tòa nhà
    @GetMapping
    public List<Building> getAllBuildings() {
        return buildingService.getBuildings();
    }

    @GetMapping("/{name}")
    public Building getBuilding(@PathVariable("name") String name){
        return buildingService.getBuilding(name);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Building createBuilding(@RequestBody @Valid BuildingCreationRequest request) {
        return buildingService.createBuilding(request);
    }

    @PutMapping("/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    public  Building updateBuilding(@PathVariable("name") String name,@RequestBody @Valid BuildingUpdateRequest request) {
        return buildingService.updateBuilding(name, request);
    }
}