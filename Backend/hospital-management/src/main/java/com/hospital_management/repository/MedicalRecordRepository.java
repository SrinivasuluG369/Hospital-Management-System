
package com.hospital_management.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.hospital_management.entity.MedicalRecord;

public interface MedicalRecordRepository
        extends JpaRepository<MedicalRecord, Long> {

    List<MedicalRecord> findByPatientId(Long patientId);
}
