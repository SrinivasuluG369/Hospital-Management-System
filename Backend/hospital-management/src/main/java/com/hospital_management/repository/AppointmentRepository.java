
package com.hospital_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hospital_management.entity.Appointment;

public interface AppointmentRepository
        extends JpaRepository<Appointment, Long> {

    // Get appointments belonging to a particular patient
    List<Appointment> findByPatientId(Long patientId);

    // Get all appointments
    List<Appointment> findAllByOrderByAppointmentDateDescAppointmentTimeDesc();

}
