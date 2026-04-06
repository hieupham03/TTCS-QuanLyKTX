package com.nhom586.ktxmanagement.mapper;

import com.nhom586.ktxmanagement.dto.request.BuildingUpdateRequest;
import com.nhom586.ktxmanagement.entity.Building;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BuildingMapper {

    Building toBuilding(BuildingUpdateRequest request);
    void updateBuilding (@MappingTarget Building building, BuildingUpdateRequest request);
}
