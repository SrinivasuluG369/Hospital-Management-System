
package com.hospital_management.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hospital_management.entity.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    boolean existsByDoctorUsername(String doctorUsername);

    boolean existsByDoctorEmail(String doctorEmail);

    boolean existsByDoctorPhone(String doctorPhone);

    Optional<Doctor> findByDoctorUsername(String doctorUsername);

}
