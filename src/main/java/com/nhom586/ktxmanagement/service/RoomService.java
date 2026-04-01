package com.nhom586.ktxmanagement.service;

import com.nhom586.ktxmanagement.entity.Room;
import com.nhom586.ktxmanagement.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {
    @Autowired
    private RoomRepository roomRepository;

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }
    public Room getRoomById(Integer id) {
        return roomRepository.findById(id).orElse(null);
    }

}