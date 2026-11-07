
package com.hospital_management.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hospital_management.entity.Appointment;
import com.hospital_management.service.AppointmentService;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    // Book appointment
    @PostMapping("/book/{patientId}")
    public ResponseEntity<?> bookAppointment(
            @PathVariable Long patientId,
            @RequestBody Appointment appointment) {

        try {
            Appointment savedAppointment =
                    appointmentService.bookAppointment(patientId, appointment);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Appointment booked successfully!",
                            "appointmentId", savedAppointment.getId(),
                            "status", savedAppointment.getStatus()
                    ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Get appointments for a particular patient
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Map<String, Object>>> getPatientAppointments(
            @PathVariable Long patientId) {

        List<Appointment> appointments =
                appointmentService.getPatientAppointments(patientId);

        List<Map<String, Object>> result = appointments.stream()
                .map(this::convertAppointmentToMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // Get all appointments - Admin
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllAppointments() {

        List<Appointment> appointments =
                appointmentService.getAllAppointments();

        List<Map<String, Object>> result = appointments.stream()
                .map(this::convertAppointmentToMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // Update appointment status - Admin
    @PutMapping("/{appointmentId}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @RequestBody Map<String, String> request) {

        try {
            String status = request.get("status");

            Appointment updatedAppointment =
                    appointmentService.updateAppointmentStatus(
                            appointmentId, status);

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Appointment status updated successfully!",
                            "appointmentId", updatedAppointment.getId(),
                            "status", updatedAppointment.getStatus()
                    )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Convert appointment entity into safe response
    private Map<String, Object> convertAppointmentToMap(
            Appointment appointment) {

        return Map.of(
                "id", appointment.getId(),
                "patientId", appointment.getPatient().getId(),
                "patientName", appointment.getPatient().getPatientName(),
                "doctor", appointment.getDoctor(),
                "appointmentDate", appointment.getAppointmentDate(),
                "appointmentTime", appointment.getAppointmentTime(),
                "reason", appointment.getReason() == null
                        ? "" : appointment.getReason(),
                "status", appointment.getStatus()
        );
    }
}
