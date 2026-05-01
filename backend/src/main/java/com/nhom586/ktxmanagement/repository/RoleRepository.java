package com.nhom586.ktxmanagement.repository;

import com.nhom586.ktxmanagement.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {

}