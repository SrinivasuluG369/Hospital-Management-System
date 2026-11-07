
package com.hospital_management.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.hospital_management.entity.Bill;

public interface BillRepository extends JpaRepository<Bill, Long> {

    List<Bill> findByPatientId(Long patientId);
}

