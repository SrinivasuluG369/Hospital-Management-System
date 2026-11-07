
package com.hospital_management.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hospital_management.entity.Appointment;
import com.hospital_management.entity.Patient;
import com.hospital_management.repository.AppointmentRepository;
import com.hospital_management.repository.PatientRepository;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
    }

    // Book appointment
    @Transactional
    public Appointment bookAppointment(Long patientId, Appointment appointment) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                    new IllegalArgumentException("Patient not found"));

        if (appointment.getAppointmentDate() == null ||
                appointment.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Please select a valid appointment date");
        }

        appointment.setPatient(patient);
        appointment.setStatus("PENDING");

        return appointmentRepository.save(appointment);
    }

    // Get appointments for a particular patient
    public List<Appointment> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    // Get all appointments for Admin
    public List<Appointment> getAllAppointments() {
        return appointmentRepository
                .findAllByOrderByAppointmentDateDescAppointmentTimeDesc();
    }

    // Update appointment status
    @Transactional
    public Appointment updateAppointmentStatus(
            Long appointmentId, String status) {

        Set<String> validStatuses = Set.of(
                "PENDING",
                "APPROVED",
                "REJECTED",
                "COMPLETED",
                "CANCELLED"
        );

        if (status == null ||
                !validStatuses.contains(status.trim().toUpperCase())) {
            throw new IllegalArgumentException(
                    "Invalid status. Use PENDING, APPROVED, REJECTED, COMPLETED or CANCELLED");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() ->
                    new IllegalArgumentException("Appointment not found"));

        appointment.setStatus(status.trim().toUpperCase());

        return appointmentRepository.save(appointment);
    }
}
