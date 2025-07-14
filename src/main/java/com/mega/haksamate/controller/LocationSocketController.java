package com.mega.haksamate.controller;

import com.mega.haksamate.dto.LocationShareDTO;
import com.mega.haksamate.dto.LocationUpdateRequestDTO;
import com.mega.haksamate.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class LocationSocketController {

    private final LocationService locationService;

    @MessageMapping("location.join")
    public void joinLocationSharing(@Payload LocationUpdateRequestDTO request, SimpMessageHeaderAccessor headerAccessor) {
        try {
            System.out.println("📍 위치 공유 참여 요청 수신: " + request.getUserId());
            System.out.println("📍 요청 데이터: 위도=" + request.getLatitude() + ", 경도=" + request.getLongitude() + ", 공개=" + request.isVisible());

            // 세션에 사용자 ID 저장
            headerAccessor.getSessionAttributes().put("userId", request.getUserId());

            locationService.joinLocationSharing(request);
            System.out.println("✅ 위치 공유 참여 완료: " + request.getUserId());
        } catch (Exception e) {
            System.err.println("❌ 위치 공유 참여 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @MessageMapping("location.update")
    public void updateLocation(@Payload LocationUpdateRequestDTO request) {
        try {
            System.out.println("📍 위치 업데이트 요청 수신: " + request.getUserId() +
                    " - 위도: " + request.getLatitude() + ", 경도: " + request.getLongitude());

            locationService.updateUserLocation(request);
            System.out.println("✅ 위치 업데이트 완료: " + request.getUserId());
        } catch (Exception e) {
            System.err.println("❌ 위치 업데이트 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @MessageMapping("location.leave")
    public void leaveLocationSharing(@Payload String userId, SimpMessageHeaderAccessor headerAccessor) {
        try {
            System.out.println("📍 위치 공유 종료 요청 수신: " + userId);

            UUID userUUID = UUID.fromString(userId);
            locationService.leaveLocationSharing(userUUID);

            // 세션에서 사용자 ID 제거
            headerAccessor.getSessionAttributes().remove("userId");

            System.out.println("✅ 위치 공유 종료 완료: " + userId);
        } catch (Exception e) {
            System.err.println("❌ 위치 공유 종료 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
