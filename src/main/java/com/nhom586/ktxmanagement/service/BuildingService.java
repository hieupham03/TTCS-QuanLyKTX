package com.nhom586.ktxmanagement.service;


import com.nhom586.ktxmanagement.dto.request.BuildingUpdateRequest;
import com.nhom586.ktxmanagement.entity.Building;
import com.nhom586.ktxmanagement.mapper.BuildingMapper;
import com.nhom586.ktxmanagement.repository.BuildingRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BuildingService {
    BuildingRepository buildingRepository;
    BuildingMapper buildingMapper;


    public List<Building> getBuildings() {
        return buildingRepository.findAll();
    }

    public Building getBuilding(String name) {
        return buildingRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("không tìm thấy toà nhà"));
    }

    public Building updateBuilding (String name, BuildingUpdateRequest request) {

        Building building = getBuilding(name);

        buildingMapper.updateBuilding(building, request);

        return buildingRepository.save(building);
    }

}
