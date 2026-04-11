package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {

    Optional<Room> findRoomByRoomNumber (String roomNumber);

    @Query("SELECT r FROM Room r WHERE r.roomGender = :gender")
    List<Room> findRoomByGender (String gender);

    @Query("SELECT r FROM Room r " +
            "JOIN r.building b " +
            "WHERE b.name LIKE %:name%")
    List<Room> findRoomsByBuildingName(@Param("name") String name);

    long countByStatus(Room.RoomStatus status);
}