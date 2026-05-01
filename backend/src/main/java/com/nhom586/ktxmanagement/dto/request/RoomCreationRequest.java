package com.nhom586.ktxmanagement.dto.request;

import com.nhom586.ktxmanagement.entity.Building;
import com.nhom586.ktxmanagement.entity.Room;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class RoomCreationRequest {
    @NotNull (message = "Toà nhà không được để trống")
    Building building;

    @NotNull(message = "Số phòng không được để trống")
    String roomNumber;

    @NotNull(message = "Sức chứa của phòng không được để trôgs")
    Integer capacity;

    @NotNull(message = "Giới tính phòng không được để trống")
    Room.RoomGender roomGender;

    Room.RoomStatus status = Room.RoomStatus.AVAILABLE;

    public enum RoomGender {
        MALE, FEMALE
    }

    public enum RoomStatus {
        AVAILABLE, FULL, MAINTENANCE
    }
}
