package com.mega.haksamate.service;

import com.mega.haksamate.dto.ReportRequestDTO;
import com.mega.haksamate.entity.Item;
import com.mega.haksamate.entity.Profile;
import com.mega.haksamate.entity.Report;

import com.mega.haksamate.repository.ItemRepository;
import com.mega.haksamate.repository.ProfileRepository;
import com.mega.haksamate.repository.ReportRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final ProfileRepository profileRepository;
    private final ItemRepository itemRepository;

    public void submitReport(ReportRequestDTO dto) {
        Profile reporter = profileRepository.findById(dto.getReporterId())
                .orElseThrow(() -> new RuntimeException("신고자 없음"));

        Profile reported = profileRepository.findById(dto.getReportedId())
                .orElseThrow(() -> new RuntimeException("피신고자 없음"));

        Item item = itemRepository.findById(dto.getItemId()).orElse(null);

        Report report = Report.builder()
                .reporter(reporter)
                .reported(reported)
                .item(item)
                .reason(dto.getReason())
                .regdate(System.currentTimeMillis())
                .status(Report.Status.접수) // 🔥 명시적으로 기본 상태 지정
                .build();

        reportRepository.save(report);

        long count = reportRepository.countByReported(reported);
        if (count >= 3) {
            // 향후 징계 처리 로직 연결 가능
        }
    }
}
