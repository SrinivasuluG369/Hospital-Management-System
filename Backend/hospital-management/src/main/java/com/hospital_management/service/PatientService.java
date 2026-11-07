
package com.hospital_management.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.hospital_management.entity.Patient;
import com.hospital_management.repository.PatientRepository;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    public PatientService(
            PatientRepository patientRepository,
            PasswordEncoder passwordEncoder) {

        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Patient registerPatient(Patient patient) {

        if (patientRepository.existsByUsername(patient.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        if (patientRepository.existsByPhone(patient.getPhone())) {
            throw new IllegalArgumentException("Phone number already registered");
        }

        patient.setPassword(passwordEncoder.encode(patient.getPassword()));

        return patientRepository.save(patient);
    }

    public boolean loginPatient(String username, String password) {

        Patient patient = patientRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid username or password"));

        return passwordEncoder.matches(password, patient.getPassword());
    }

    public Patient getPatientProfile(String username) {

        return patientRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Patient not found"));
    }

    // Get all registered patients
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }
}
