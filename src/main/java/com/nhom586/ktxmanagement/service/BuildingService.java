package com.nhom586.ktxmanagement.service;


import com.nhom586.ktxmanagement.dto.request.BuildingCreationRequest;
import com.nhom586.ktxmanagement.dto.request.BuildingUpdateRequest;
import com.nhom586.ktxmanagement.entity.Building;
import com.nhom586.ktxmanagement.mapper.BuildingMapper;
import com.nhom586.ktxmanagement.repository.BuildingRepository;
import com.nhom586.ktxmanagement.repository.RoomRepository;
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
    RoomRepository roomRepository;
    BuildingMapper buildingMapper;


    public Building createBuilding(BuildingCreationRequest request) {
        if (buildingRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Tòa nhà đã tồn tại");
        }

        Building building = buildingMapper.toBuilding(request);

        return buildingRepository.save(building);
    }

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

    public void deleteBuilding(String name) {
        Building building = getBuilding(name);
        
        // Kiểm tra xem tòa nhà có chứa phòng nào không
        List<com.nhom586.ktxmanagement.entity.Room> rooms = roomRepository.findRoomsByBuildingName(name);
        if (!rooms.isEmpty()) {
            throw new RuntimeException("Không thể xóa tòa nhà vì vẫn còn phòng bên trong.");
        }
        
        buildingRepository.delete(building);
    }

}
