package com.nhom586.ktxmanagement.controller;

import com.nhom586.ktxmanagement.dto.request.RoomCreationRequest;
import com.nhom586.ktxmanagement.dto.request.RoomUpdateRequest;
import com.nhom586.ktxmanagement.entity.Room;
import com.nhom586.ktxmanagement.service.RoomService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomController {
    RoomService roomService;

    // Tạo phòng mới
    @PostMapping
    public Room createRoom(@Valid @RequestBody RoomCreationRequest request) {
        return roomService.createRoom(request);
    }

    @GetMapping
    public List<Room> getAllRooms(@RequestParam(required = false) Room.RoomGender gender) {
        return roomService.getAllRooms();
    }

    @GetMapping("/{id}")
    public Room getRoomById(@Valid @PathVariable Integer id) {
        return roomService.getRoomById(id);
    }

    @GetMapping("number/{roomNumber}")
    public Room getRoomByRoomNumber(@Valid @PathVariable("roomNumber") String roomNumber) {
        return roomService.getRoomByRoomNumber(roomNumber);
    }

    // Chỉnh sửa thông tin phòng theo số hiệu phòng
    @PutMapping("number/{roomNumber}")
    public Room updateRoomByRoomNumber(@Valid @PathVariable("roomNumber") String roomNumber,
            @RequestBody RoomUpdateRequest request) {
        return roomService.uodateRoom(roomNumber, request);
    }

}