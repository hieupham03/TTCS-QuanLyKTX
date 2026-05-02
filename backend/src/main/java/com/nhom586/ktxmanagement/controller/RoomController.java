package com.nhom586.ktxmanagement.controller;

import com.nhom586.ktxmanagement.dto.request.RoomCreationRequest;
import com.nhom586.ktxmanagement.dto.request.RoomUpdateRequest;
import com.nhom586.ktxmanagement.entity.Room;
import com.nhom586.ktxmanagement.service.RoomService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasRole('ADMIN')")
    public Room createRoom(@Valid @RequestBody RoomCreationRequest request) {
        return roomService.createRoom(request);
    }

    @GetMapping
    public List<Room> getRooms(@RequestParam(required = false) Room.RoomGender gender) {
        if (gender == null) {
            return roomService.getAllRooms();
        }
        return roomService.getRoomsByGender(String.valueOf(gender));
    }

    @GetMapping("/building/{name}")
    public List<Room> getRoomsByBuildingName(@PathVariable("name") String name) {
        return roomService.getRoomsByBuildingName(name);
    }

    @GetMapping("/{id}")
    public Room getRoomById(@PathVariable Integer id) {
        return roomService.getRoomById(id);
    }

    @GetMapping("/number/{roomNumber}")
    public Room getRoomByRoomNumber(@PathVariable("roomNumber") String roomNumber) {
        return roomService.getRoomByRoomNumber(roomNumber);
    }

    // Chỉnh sửa thông tin phòng theo số hiệu phòng
    @PutMapping("/number/{roomNumber}")
    @PreAuthorize("hasRole('ADMIN')")
    public Room updateRoomByRoomNumber(@PathVariable("roomNumber") String roomNumber,
            @Valid @RequestBody RoomUpdateRequest request) {
        return roomService.updateRoom(roomNumber, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteRoom(@PathVariable Integer id) {
        roomService.deleteRoom(id);
    }
}