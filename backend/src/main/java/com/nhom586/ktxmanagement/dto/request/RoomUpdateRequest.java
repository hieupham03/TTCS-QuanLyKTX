package com.nhom586.ktxmanagement.dto.request;


import com.nhom586.ktxmanagement.entity.Room;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class RoomUpdateRequest {
    String roomNumber;


    Integer capacity;

    Room.RoomGender roomGender;

    Room.RoomStatus status;

    public enum RoomGender {
        MALE, FEMALE
    }

    public enum RoomStatus {
        AVAILABLE, FULL, MAINTENANCE
    }
}
