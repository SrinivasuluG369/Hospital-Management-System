
package com.hospital_management.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hospital_management.service.PatientService;
import com.hospital_management.security.JwtService;
import com.hospital_management.security.AuthResponse;

@RestController
@RequestMapping("/api/patients")
public class PatientLoginController {

    private final PatientService patientService;
    private final JwtService jwtService;

    public PatientLoginController(
            PatientService patientService,
            JwtService jwtService) {

        this.patientService = patientService;
        this.jwtService = jwtService;
    }

    // Patient Login with JWT
    @PostMapping("/login")
    public ResponseEntity<?> loginPatient(
            @RequestBody LoginRequest request) {

        try {
            boolean success = patientService.loginPatient(
                    request.getUsername(),
                    request.getPassword()
            );

            if (success) {

                String token = jwtService.generateToken(
                        request.getUsername(),
                        "PATIENT"
                );

                AuthResponse response = new AuthResponse(
                        "Patient login successful!",
                        request.getUsername(),
                        "PATIENT",
                        token
                );

                return ResponseEntity.ok(response);
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");

        } catch (IllegalArgumentException e) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }
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
