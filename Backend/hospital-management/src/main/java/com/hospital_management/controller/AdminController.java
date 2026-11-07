
package com.hospital_management.controller;

import java.util.Map;
import java.util.LinkedHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hospital_management.entity.Admin;
import com.hospital_management.service.AdminService;
import com.hospital_management.security.JwtService;
import com.hospital_management.security.AuthResponse;

@RestController
@RequestMapping("/api/admins")
public class AdminController {

    private final AdminService adminService;
    private final JwtService jwtService;

    public AdminController(
            AdminService adminService,
            JwtService jwtService) {
        this.adminService = adminService;
        this.jwtService = jwtService;
    }

    // Admin Registration
    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(
            @RequestBody AdminRegistrationRequest request) {

        try {
            Admin admin = new Admin();

            admin.setAdminName(request.getAdminName());
            admin.setDesignation(request.getDesignation());
            admin.setAdminEmail(request.getAdminEmail());
            admin.setAdminPhone(request.getAdminPhone());
            admin.setAdminUsername(request.getAdminUsername());
            admin.setAdminPassword(request.getAdminPassword());

            Admin savedAdmin = adminService.registerAdmin(
                    admin,
                    request.getAdminConfirmPassword()
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Admin registered successfully!",
                            "adminId", savedAdmin.getId()
                    ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Admin Login with JWT
    @PostMapping("/login")
    public ResponseEntity<?> loginAdmin(
            @RequestBody LoginRequest request) {

        try {
            boolean success = adminService.loginAdmin(
                    request.getUsername(),
                    request.getPassword()
            );

            if (success) {
                String token = jwtService.generateToken(
                        request.getUsername(), "ADMIN"
                );

                return ResponseEntity.ok(
                        new AuthResponse(
                                "Admin login successful!",
                                request.getUsername(),
                                "ADMIN",
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

    // Admin Profile
    @GetMapping("/profile/{username}")
    public ResponseEntity<?> getAdminProfile(
            @PathVariable String username) {

        try {
            Admin admin = adminService.getAdminProfile(username);

            Map<String, Object> profile = new LinkedHashMap<>();
            profile.put("id", admin.getId());
            profile.put("adminName", admin.getAdminName());
            profile.put("designation", admin.getDesignation());
            profile.put("adminEmail", admin.getAdminEmail());
            profile.put("adminPhone", admin.getAdminPhone());
            profile.put("adminUsername", admin.getAdminUsername());

            return ResponseEntity.ok(profile);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Admin Registration Request
    public static class AdminRegistrationRequest {

        private String adminName;
        private String designation;
        private String adminEmail;
        private String adminPhone;
        private String adminUsername;
        private String adminPassword;
        private String adminConfirmPassword;

        public String getAdminName() {
            return adminName;
        }

        public void setAdminName(String adminName) {
            this.adminName = adminName;
        }

        public String getDesignation() {
            return designation;
        }

        public void setDesignation(String designation) {
            this.designation = designation;
        }

        public String getAdminEmail() {
            return adminEmail;
        }

        public void setAdminEmail(String adminEmail) {
            this.adminEmail = adminEmail;
        }

        public String getAdminPhone() {
            return adminPhone;
        }

        public void setAdminPhone(String adminPhone) {
            this.adminPhone = adminPhone;
        }

        public String getAdminUsername() {
            return adminUsername;
        }

        public void setAdminUsername(String adminUsername) {
            this.adminUsername = adminUsername;
        }

        public String getAdminPassword() {
            return adminPassword;
        }

        public void setAdminPassword(String adminPassword) {
            this.adminPassword = adminPassword;
        }

        public String getAdminConfirmPassword() {
            return adminConfirmPassword;
        }

        public void setAdminConfirmPassword(String adminConfirmPassword) {
            this.adminConfirmPassword = adminConfirmPassword;
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
