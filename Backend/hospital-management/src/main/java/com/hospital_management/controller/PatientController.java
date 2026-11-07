
package com.hospital_management.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hospital_management.entity.Patient;
import com.hospital_management.service.PatientService;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerPatient(@RequestBody Patient patient) {

        try {
            Patient savedPatient = patientService.registerPatient(patient);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("message", "Patient registered successfully!");
            response.put("patientId", savedPatient.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            Map<String, String> error = new LinkedHashMap<>();
            error.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<?> getPatientProfile(
            @PathVariable String username) {

        try {
            Patient patient = patientService.getPatientProfile(username);

            Map<String, Object> profile = new LinkedHashMap<>();
            profile.put("id", patient.getId());
            profile.put("patientName", patient.getPatientName());
            profile.put("dob", patient.getDob());
            profile.put("gender", patient.getGender());
            profile.put("bloodGroup", patient.getBloodGroup());
            profile.put("phone", patient.getPhone());
            profile.put("email", patient.getEmail());
            profile.put("address", patient.getAddress());
            profile.put("emergency", patient.getEmergency());
            profile.put("username", patient.getUsername());

            return ResponseEntity.ok(profile);

        } catch (IllegalArgumentException e) {
            Map<String, String> error = new LinkedHashMap<>();
            error.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Get all registered patients (Admin)
    @GetMapping
    public ResponseEntity<?> getAllPatients() {

        List<Map<String, Object>> patients = patientService.getAllPatients()
                .stream()
                .map(patient -> {
                    Map<String, Object> data = new LinkedHashMap<>();

                    data.put("id", patient.getId());
                    data.put("patientName", patient.getPatientName());
                    data.put("dob", patient.getDob());
                    data.put("gender", patient.getGender());
                    data.put("bloodGroup", patient.getBloodGroup());
                    data.put("phone", patient.getPhone());
                    data.put("email", patient.getEmail());
                    data.put("address", patient.getAddress());
                    data.put("emergency", patient.getEmergency());
                    data.put("username", patient.getUsername());

                    return data;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(patients);
    }
}
