package com.mega.haksamate.controller;

import com.mega.haksamate.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class LocationController {

    private final LocationService locationService;

    @PostMapping("/nearby")
    public ResponseEntity<String> getNearbyUsers(
            @RequestParam String userId,
            @RequestParam double latitude,
            @RequestParam double longitude) {

        try {
            System.out.println("🌐 REST API 근처 사용자 조회 요청: " + userId);

            UUID userUUID = UUID.fromString(userId);
            locationService.getNearbyUsers(userUUID, latitude, longitude);

            return ResponseEntity.ok("근처 사용자 조회 완료");
        } catch (Exception e) {
            System.err.println("❌ REST API 근처 사용자 조회 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body("조회 실패: " + e.getMessage());
        }
    }

    @GetMapping("/active-count")
    public ResponseEntity<Integer> getActiveUsersCount() {
        try {
            int count = locationService.getActiveUsersCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            System.err.println("❌ 활성 사용자 수 조회 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(0);
        }
    }
}
