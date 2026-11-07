
package com.hospital_management.service;

import org.springframework.stereotype.Service;

import com.hospital_management.repository.PatientRepository;
import com.hospital_management.repository.DoctorRepository;
import com.hospital_management.repository.AppointmentRepository;
import com.hospital_management.repository.BillRepository;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AdminStatisticsService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final BillRepository billRepository;

    public AdminStatisticsService(
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            BillRepository billRepository) {

        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.billRepository = billRepository;
    }

    public Map<String, Long> getDashboardStatistics() {

        Map<String, Long> statistics = new LinkedHashMap<>();

        statistics.put("totalPatients",
                patientRepository.count());

        statistics.put("totalDoctors",
                doctorRepository.count());

        statistics.put("totalAppointments",
                appointmentRepository.count());

        statistics.put("totalBills",
                billRepository.count());

        return statistics;
    }
}
