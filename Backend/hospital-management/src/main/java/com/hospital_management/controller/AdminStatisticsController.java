
package com.hospital_management.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hospital_management.service.AdminStatisticsService;

@RestController
@RequestMapping("/api/admin")
public class AdminStatisticsController {

    private final AdminStatisticsService statisticsService;

    public AdminStatisticsController(
            AdminStatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getStatistics() {

        Map<String, Long> statistics =
                statisticsService.getDashboardStatistics();

        return ResponseEntity.ok(statistics);
    }
}
