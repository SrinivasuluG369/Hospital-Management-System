
package com.hospital_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.hospital_management.entity.Patient;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    boolean existsByUsername(String username);

    boolean existsByPhone(String phone);

    Optional<Patient> findByUsername(String username);
}
