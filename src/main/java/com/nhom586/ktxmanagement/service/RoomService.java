package com.nhom586.ktxmanagement.service;

import com.nhom586.ktxmanagement.dto.request.RoomCreationRequest;
import com.nhom586.ktxmanagement.dto.request.RoomUpdateRequest;
import com.nhom586.ktxmanagement.entity.Building;
import com.nhom586.ktxmanagement.entity.Contract;
import com.nhom586.ktxmanagement.entity.Room;
import com.nhom586.ktxmanagement.mapper.RoomMapper;
import com.nhom586.ktxmanagement.repository.BuildingRepository;
import com.nhom586.ktxmanagement.repository.ContractRepository;
import com.nhom586.ktxmanagement.repository.RoomRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomService {
    RoomRepository roomRepository;
    BuildingRepository buildingRepository;
    RoomMapper roomMapper;
    ContractRepository contractRepository;

    // Tạo phòng mới
    public Room createRoom(RoomCreationRequest request) {
        Room room = roomMapper.toRoom(request);

        Building building = buildingRepository.findByName(request.getBuilding().getName())
                    .orElseThrow(() -> new RuntimeException("Toà nhà không tồn tại"));

        room.setStatus(Room.RoomStatus.AVAILABLE);

        return roomRepository.save(room);
    }

    // Lấy danh sách tất cả các phòng
    public List<Room> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        rooms.forEach(this::updateRoomStatus);
        return rooms;
    }

    // Tìm kiếm phòng theo id
    public Room getRoomById(Integer id) {
        Room room = roomRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng có id: " + id));
        updateRoomStatus(room);
        return room;
    }

    // Tìm kiếm phòng theo số phòng
    public Room getRoomByRoomNumber(String roomNumber) {
        Room room = roomRepository.findRoomByRoomNumber(roomNumber)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng có số là: " + roomNumber));
        updateRoomStatus(room);
        return room;
    }

    //cập nhật thông tin phòng
    public Room uodateRoom (String roomNumber, RoomUpdateRequest request) {
        Room room = getRoomByRoomNumber(roomNumber);

        roomMapper.updateRoom(room, request);

        return roomRepository.save(room);
    }

    // Cập nhật trạng thái phòng dựa vào số sinh viên đang ở
    public void updateRoomStatus(Room room) {
        // Đếm số hợp đồng active trong phòng
        long activeStudentCount = contractRepository.countByRoomIdAndStatus(
                room.getId(), 
                Contract.ContractStatus.ACTIVE
        );

        // Đếm số lượng hợp đồng hết hạn
//        long disabledStudentCount = contractRepository.countByRoomIdAndStatus(
//                room.getId(),
//                Contract.ContractStatus.EXPIRED)
//        + contractRepository.countByRoomIdAndStatus(
//                room.getId(),
//                Contract.ContractStatus.CANCELLED
//        );


        // So sánh với capacity để cập nhật trạng thái
        if (activeStudentCount < room.getCapacity()) {
            room.setStatus(Room.RoomStatus.AVAILABLE);
        } else if (activeStudentCount == room.getCapacity()) {
            room.setStatus(Room.RoomStatus.FULL);
        }

        roomRepository.save(room);
    }

    // Cập nhật trạng thái tất cả các phòng
    public void updateAllRoomsStatus() {
        List<Room> allRooms = roomRepository.findAll();
        for (Room room : allRooms) {
            updateRoomStatus(room);
        }
    }

}