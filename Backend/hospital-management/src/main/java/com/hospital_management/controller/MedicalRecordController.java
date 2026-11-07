
package com.hospital_management.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import com.hospital_management.entity.MedicalRecord;
import com.hospital_management.service.MedicalRecordService;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class MedicalRecordController {

    private final MedicalRecordService recordService;

    public MedicalRecordController(MedicalRecordService recordService) {
        this.recordService = recordService;
    }

    // Add Medical Record
    @PostMapping("/patient/{patientId}")
    public ResponseEntity<?> addRecord(
            @PathVariable Long patientId,
            @RequestBody MedicalRecord record) {

        try {
            MedicalRecord saved =
                    recordService.addRecord(patientId, record);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Medical record added successfully!",
                            "recordId", saved.getId()
                    ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Get Patient Medical Records
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientRecords(
            @PathVariable Long patientId,
            Authentication authentication) {

        try {
            boolean privileged = authentication.getAuthorities()
                    .stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(role ->
                            role.equals("ROLE_DOCTOR") ||
                            role.equals("ROLE_ADMIN"));

            List<MedicalRecord> records =
                    recordService.getPatientRecords(
                            patientId,
                            authentication.getName(),
                            privileged
                    );

            return ResponseEntity.ok(
                    records.stream()
                            .map(this::toSafeResponse)
                            .toList()
            );

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Get All Medical Records
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllRecords() {

        List<Map<String, Object>> records =
                recordService.getAllRecords()
                        .stream()
                        .map(this::toSafeResponse)
                        .toList();

        return ResponseEntity.ok(records);
    }

    // Delete Medical Record
    @DeleteMapping("/{recordId}")
    public ResponseEntity<?> deleteRecord(
            @PathVariable Long recordId) {

        try {
            recordService.deleteRecord(recordId);

            return ResponseEntity.ok(
                    Map.of("message",
                            "Medical record deleted successfully"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Safe Response
    private Map<String, Object> toSafeResponse(
            MedicalRecord record) {

        return Map.of(
                "id", record.getId(),
                "patientId", record.getPatient().getId(),
                "patientName", record.getPatient().getPatientName(),
                "doctorName", record.getDoctorName() == null
                        ? "" : record.getDoctorName(),
                "diagnosis", record.getDiagnosis() == null
                        ? "" : record.getDiagnosis(),
                "treatment", record.getTreatment() == null
                        ? "" : record.getTreatment(),
                "recordDate", record.getRecordDate() == null
                        ? "" : record.getRecordDate()
        );
    }
}
