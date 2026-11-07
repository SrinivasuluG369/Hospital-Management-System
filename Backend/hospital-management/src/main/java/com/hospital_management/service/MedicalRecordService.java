
package com.hospital_management.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.hospital_management.entity.MedicalRecord;
import com.hospital_management.entity.Patient;
import com.hospital_management.repository.MedicalRecordRepository;
import com.hospital_management.repository.PatientRepository;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository recordRepository;
    private final PatientRepository patientRepository;

    public MedicalRecordService(
            MedicalRecordRepository recordRepository,
            PatientRepository patientRepository) {

        this.recordRepository = recordRepository;
        this.patientRepository = patientRepository;
    }

    // Add Medical Record
    public MedicalRecord addRecord(
            Long patientId,
            MedicalRecord record) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Patient not found"));

        if (record.getDiagnosis() == null ||
                record.getDiagnosis().isBlank()) {
            throw new IllegalArgumentException("Diagnosis is required");
        }

        if (record.getTreatment() == null ||
                record.getTreatment().isBlank()) {
            throw new IllegalArgumentException("Treatment is required");
        }

        if (record.getRecordDate() == null) {
            record.setRecordDate(LocalDate.now());
        }

        record.setPatient(patient);

        return recordRepository.save(record);
    }

    // Get Patient Records With Ownership Validation
    public List<MedicalRecord> getPatientRecords(
            Long patientId,
            String username,
            boolean privileged) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Patient not found"));

        if (!privileged &&
                !patient.getUsername().equals(username)) {

            throw new SecurityException(
                    "You can only view your own medical records");
        }

        return recordRepository.findByPatientId(patientId);
    }

    // Get All Medical Records
    public List<MedicalRecord> getAllRecords() {
        return recordRepository.findAll();
    }

    // Delete Medical Record
    public void deleteRecord(Long recordId) {

        if (!recordRepository.existsById(recordId)) {
            throw new IllegalArgumentException(
                    "Medical record not found");
        }

        recordRepository.deleteById(recordId);
    }
}
