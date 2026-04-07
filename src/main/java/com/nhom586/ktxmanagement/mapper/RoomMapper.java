package com.nhom586.ktxmanagement.mapper;

import com.nhom586.ktxmanagement.dto.request.RoomCreationRequest;
import com.nhom586.ktxmanagement.dto.request.RoomUpdateRequest;
import com.nhom586.ktxmanagement.entity.Room;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface RoomMapper {
    Room toRoom (RoomCreationRequest request);
    void updateRoom (@MappingTarget Room room, RoomUpdateRequest request);
}
