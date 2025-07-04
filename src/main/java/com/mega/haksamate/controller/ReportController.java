package com.mega.haksamate.controller;

import com.mega.haksamate.dto.ReportRequestDTO;
import com.mega.haksamate.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<Map<String, String>> submitReport(@RequestBody ReportRequestDTO dto) {
        reportService.submitReport(dto);
        return ResponseEntity.ok(Map.of("message", "신고 완료"));
    }
}
