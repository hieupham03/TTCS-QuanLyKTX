package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Integer> {
}