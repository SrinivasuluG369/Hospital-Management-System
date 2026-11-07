
package com.hospital_management.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.hospital_management.entity.Bill;
import com.hospital_management.entity.Patient;
import com.hospital_management.repository.BillRepository;
import com.hospital_management.repository.PatientRepository;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final PatientRepository patientRepository;

    public BillService(
            BillRepository billRepository,
            PatientRepository patientRepository) {

        this.billRepository = billRepository;
        this.patientRepository = patientRepository;
    }

    // Generate Bill
    public Bill generateBill(Long patientId, Bill bill) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Patient not found"));

        if (bill.getBillType() == null ||
                bill.getBillType().isBlank()) {
            throw new IllegalArgumentException("Bill type is required");
        }

        if (bill.getAmount() == null ||
                bill.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Amount must be greater than zero");
        }

        if (bill.getPaymentMethod() == null ||
                bill.getPaymentMethod().isBlank()) {
            throw new IllegalArgumentException(
                    "Payment method is required");
        }

        bill.setPatient(patient);
        bill.setPaymentStatus("PENDING");
        bill.setBillDate(LocalDate.now());

        return billRepository.save(bill);
    }

    // Get Patient Bills with ownership verification
    public List<Bill> getPatientBills(
            Long patientId,
            String username,
            boolean isAdmin) {

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Patient not found"));

        if (!isAdmin && !patient.getUsername().equals(username)) {
            throw new SecurityException(
                    "You can only view your own bills");
        }

        return billRepository.findByPatientId(patientId);
    }

    // Get All Bills
    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    // Update Payment Status
    public Bill updatePaymentStatus(Long billId, String status) {

        Bill bill = billRepository.findById(billId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Bill not found"));

        if (!"PAID".equals(status) &&
                !"PENDING".equals(status)) {
            throw new IllegalArgumentException(
                    "Invalid payment status");
        }

        bill.setPaymentStatus(status);

        return billRepository.save(bill);
    }
}
