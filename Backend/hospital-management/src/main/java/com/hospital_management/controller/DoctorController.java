
package com.hospital_management.controller;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hospital_management.entity.Doctor;
import com.hospital_management.service.DoctorService;
import com.hospital_management.security.JwtService;
import com.hospital_management.security.AuthResponse;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;
    private final JwtService jwtService;

    public DoctorController(
            DoctorService doctorService,
            JwtService jwtService) {
        this.doctorService = doctorService;
        this.jwtService = jwtService;
    }

    // Doctor Registration
    @PostMapping("/register")
    public ResponseEntity<?> registerDoctor(
            @RequestBody Doctor doctor) {

        try {
            Doctor savedDoctor = doctorService.registerDoctor(doctor);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Doctor registered successfully!",
                            "doctorId", savedDoctor.getId()
                    ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Doctor Login with JWT
    @PostMapping("/login")
    public ResponseEntity<?> loginDoctor(
            @RequestBody LoginRequest request) {

        try {
            boolean success = doctorService.loginDoctor(
                    request.getUsername(),
                    request.getPassword()
            );

            if (success) {
                String token = jwtService.generateToken(
                        request.getUsername(), "DOCTOR"
                );

                return ResponseEntity.ok(
                        new AuthResponse(
                                "Doctor login successful!",
                                request.getUsername(),
                                "DOCTOR",
                                token
                        )
                );
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid credentials"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid credentials"));
        }
    }

    // Doctor Profile
    @GetMapping("/profile/{username}")
    public ResponseEntity<?> getDoctorProfile(
            @PathVariable String username) {

        try {
            Doctor doctor = doctorService.getDoctorProfile(username);

            Map<String, Object> profile = new LinkedHashMap<>();
            profile.put("id", doctor.getId());
            profile.put("doctorName", doctor.getDoctorName());
            profile.put("specialization", doctor.getSpecialization());
            profile.put("qualification", doctor.getQualification());
            profile.put("experience", doctor.getExperience());
            profile.put("doctorPhone", doctor.getDoctorPhone());
            profile.put("doctorEmail", doctor.getDoctorEmail());
            profile.put("department", doctor.getDepartment());
            profile.put("doctorUsername", doctor.getDoctorUsername());

            return ResponseEntity.ok(profile);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Get All Doctors
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllDoctors() {

        List<Map<String, Object>> doctors =
                doctorService.getAllDoctors()
                .stream()
                .map(doctor -> {

                    Map<String, Object> data = new LinkedHashMap<>();

                    data.put("id", doctor.getId());
                    data.put("doctorName", doctor.getDoctorName());
                    data.put("specialization", doctor.getSpecialization());
                    data.put("qualification", doctor.getQualification());
                    data.put("experience", doctor.getExperience());
                    data.put("department", doctor.getDepartment());
                    data.put("doctorPhone", doctor.getDoctorPhone());
                    data.put("doctorEmail", doctor.getDoctorEmail());
                    data.put("doctorUsername", doctor.getDoctorUsername());

                    return data;
                })
                .toList();

        return ResponseEntity.ok(doctors);
    }

    // Login Request
    public static class LoginRequest {

        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
