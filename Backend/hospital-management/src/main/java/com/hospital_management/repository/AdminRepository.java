
package com.hospital_management.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hospital_management.entity.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    boolean existsByAdminUsername(String adminUsername);

    boolean existsByAdminEmail(String adminEmail);

    Optional<Admin> findByAdminUsername(String adminUsername);

}
