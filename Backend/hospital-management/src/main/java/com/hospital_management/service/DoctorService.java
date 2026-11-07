
package com.hospital_management.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hospital_management.entity.Doctor;
import com.hospital_management.repository.DoctorRepository;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorService(
            DoctorRepository doctorRepository,
            PasswordEncoder passwordEncoder) {

        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Doctor registerDoctor(Doctor doctor) {

        if (doctorRepository.existsByDoctorUsername(
                doctor.getDoctorUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        if (doctorRepository.existsByDoctorEmail(
                doctor.getDoctorEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        if (doctorRepository.existsByDoctorPhone(
                doctor.getDoctorPhone())) {
            throw new IllegalArgumentException("Phone already registered");
        }

        doctor.setDoctorPassword(
                passwordEncoder.encode(doctor.getDoctorPassword()));

        return doctorRepository.save(doctor);
    }

    public boolean loginDoctor(String username, String password) {

        Doctor doctor = doctorRepository
                .findByDoctorUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid credentials"));

        return passwordEncoder.matches(
                password, doctor.getDoctorPassword());
    }

    public Doctor getDoctorProfile(String username) {

        return doctorRepository.findByDoctorUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("Doctor not found"));
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }
}
