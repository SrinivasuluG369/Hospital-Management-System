
package com.hospital_management.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hospital_management.entity.Admin;
import com.hospital_management.repository.AdminRepository;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder) {

        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Admin registerAdmin(Admin admin, String confirmPassword) {

        if (admin.getAdminPassword() == null ||
                admin.getAdminPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        if (!admin.getAdminPassword().equals(confirmPassword)) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (adminRepository.existsByAdminUsername(
                admin.getAdminUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        if (adminRepository.existsByAdminEmail(
                admin.getAdminEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        admin.setAdminPassword(
                passwordEncoder.encode(admin.getAdminPassword()));

        return adminRepository.save(admin);
    }

    public boolean loginAdmin(String username, String password) {

        Admin admin = adminRepository
                .findByAdminUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid credentials"));

        return passwordEncoder.matches(
                password, admin.getAdminPassword());
    }

    public Admin getAdminProfile(String username) {

        return adminRepository.findByAdminUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("Admin not found"));
    }
}
