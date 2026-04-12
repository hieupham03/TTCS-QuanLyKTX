package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {

    Optional<Room> findRoomByRoomNumber (String roomNumber);

    long countByStatus(Room.RoomStatus status);
}