
package com.hospital_management.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import com.hospital_management.entity.Bill;
import com.hospital_management.service.BillService;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "http://127.0.0.1:5500")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    // Generate Bill
    @PostMapping("/generate/{patientId}")
    public ResponseEntity<?> generateBill(
            @PathVariable Long patientId,
            @RequestBody Bill bill) {

        try {
            Bill savedBill =
                    billService.generateBill(patientId, bill);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Bill generated successfully!",
                            "billId", savedBill.getId(),
                            "paymentStatus", savedBill.getPaymentStatus()
                    ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Get Patient Bills
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientBills(
            @PathVariable Long patientId,
            Authentication authentication) {

        try {
            boolean isAdmin = authentication.getAuthorities()
                    .stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch("ROLE_ADMIN"::equals);

            List<Bill> bills = billService.getPatientBills(
                    patientId,
                    authentication.getName(),
                    isAdmin
            );

            return ResponseEntity.ok(
                    bills.stream()
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

    // Get All Bills - Admin
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllBills() {

        List<Map<String, Object>> bills =
                billService.getAllBills()
                        .stream()
                        .map(this::toSafeResponse)
                        .toList();

        return ResponseEntity.ok(bills);
    }

    // Update Payment Status
    @PutMapping("/{billId}/status")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable Long billId,
            @RequestBody Map<String, String> request) {

        try {
            Bill updatedBill = billService.updatePaymentStatus(
                    billId,
                    request.get("paymentStatus")
            );

            return ResponseEntity.ok(toSafeResponse(updatedBill));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Safe Response
    private Map<String, Object> toSafeResponse(Bill bill) {

        return Map.of(
                "id", bill.getId(),
                "patientId", bill.getPatient().getId(),
                "patientName", bill.getPatient().getPatientName(),
                "billType", bill.getBillType(),
                "amount", bill.getAmount(),
                "paymentMethod", bill.getPaymentMethod(),
                "paymentStatus", bill.getPaymentStatus(),
                "billDate", bill.getBillDate()
        );
    }
}
