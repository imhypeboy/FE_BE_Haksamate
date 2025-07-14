package com.mega.haksamate.service;

import com.mega.haksamate.dto.LocationShareDTO;
import com.mega.haksamate.dto.LocationUpdateRequestDTO;
import com.mega.haksamate.entity.Profile;
import com.mega.haksamate.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ProfileRepository profileRepository;

    // 메모리에 현재 위치 정보 저장 (실제로는 Redis 사용 권장)
    private final Map<UUID, LocationShareDTO> activeLocations = new ConcurrentHashMap<>();

    public void updateUserLocation(LocationUpdateRequestDTO request) {
        try {
            System.out.println("📍 위치 업데이트 처리 시작: " + request.getUserId());
            System.out.println("📍 요청 데이터 상세: 위도=" + request.getLatitude() +
                    ", 경도=" + request.getLongitude() + ", 가시성=" + request.isVisible());

            Profile user = profileRepository.findById(request.getUserId())
                    .orElse(null);

            if (user == null) {
                System.err.println("❌ 사용자를 찾을 수 없습니다: " + request.getUserId());
                return;
            }

            LocationShareDTO locationData = new LocationShareDTO(
                    request.getUserId(),
                    user.getName(),
                    request.getLatitude(),
                    request.getLongitude(),
                    LocalDateTime.now(),
                    "online",
                    request.isVisible()
            );

            // 위치 정보 저장
            activeLocations.put(request.getUserId(), locationData);
            System.out.println("📍 위치 정보 저장 완료: " + user.getName() + " - " +
                    request.getLatitude() + ", " + request.getLongitude() + ", 가시성: " + request.isVisible());

            // 위치 공개 설정인 경우에만 브로드캐스트
            if (request.isVisible()) {
                messagingTemplate.convertAndSend("/topic/location/nearby", locationData);
                System.out.println("📡 위치 정보 브로드캐스트 완료: " + user.getName());
            } else {
                System.out.println("🔒 위치 비공개 설정으로 브로드캐스트 생략: " + user.getName());
            }
        } catch (Exception e) {
            System.err.println("❌ 위치 업데이트 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void joinLocationSharing(LocationUpdateRequestDTO request) {
        try {
            System.out.println("📍 위치 공유 참여 처리 시작: " + request.getUserId());
            System.out.println("📍 참여 요청 데이터: 위도=" + request.getLatitude() +
                    ", 경도=" + request.getLongitude() + ", 가시성=" + request.isVisible());

            // 현재 위치 업데이트
            updateUserLocation(request);

            // 현재 활성 사용자들의 위치 정보 전송 (자신 제외)
            var otherUsers = activeLocations.values().stream()
                    .filter(LocationShareDTO::isVisible)
                    .filter(loc -> !loc.getUserId().equals(request.getUserId()))
                    .collect(Collectors.toList());

            System.out.println("📤 다른 활성 사용자 " + otherUsers.size() + "명의 위치 정보 전송");

            otherUsers.forEach(loc -> {
                try {
                    messagingTemplate.convertAndSendToUser(
                            request.getUserId().toString(),
                            "/queue/location/initial",
                            loc
                    );
                    System.out.println("📤 초기 위치 데이터 전송 완료: " + loc.getUserName() +
                            " -> " + request.getUserId());
                } catch (Exception e) {
                    System.err.println("❌ 초기 위치 데이터 전송 실패: " + e.getMessage());
                }
            });

            System.out.println("✅ 위치 공유 참여 완료: " + request.getUserId() +
                    ", 총 활성 사용자 수: " + activeLocations.size());
        } catch (Exception e) {
            System.err.println("❌ 위치 공유 참여 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void leaveLocationSharing(UUID userId) {
        try {
            System.out.println("📍 위치 공유 종료 처리 시작: " + userId);

            LocationShareDTO removedLocation = activeLocations.remove(userId);

            if (removedLocation != null) {
                // 오프라인 상태로 브로드캐스트
                removedLocation.setStatus("offline");
                messagingTemplate.convertAndSend("/topic/location/nearby", removedLocation);
                System.out.println("👋 사용자 위치 공유 종료 브로드캐스트: " + removedLocation.getUserName() +
                        ", 남은 활성 사용자 수: " + activeLocations.size());
            } else {
                System.out.println("⚠️ 제거할 위치 정보를 찾을 수 없습니다: " + userId);
            }
        } catch (Exception e) {
            System.err.println("❌ 위치 공유 종료 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // 근처 사용자 조회 (반경 1km 내)
    public void getNearbyUsers(UUID userId, double latitude, double longitude) {
        try {
            System.out.println("🔍 근처 사용자 조회 시작: " + userId + " - " + latitude + ", " + longitude);
            System.out.println("🔍 현재 활성 사용자 목록:");
            activeLocations.forEach((id, location) -> {
                System.out.println("  - " + location.getUserName() + " (가시성: " + location.isVisible() + ")");
            });

            var nearbyUsers = activeLocations.values().stream()
                    .filter(LocationShareDTO::isVisible)
                    .filter(loc -> !loc.getUserId().equals(userId))
                    .filter(loc -> calculateDistance(latitude, longitude, loc.getLatitude(), loc.getLongitude()) <= 1.0)
                    .collect(Collectors.toList());

            System.out.println("📍 근처 사용자 " + nearbyUsers.size() + "명 발견");

            nearbyUsers.forEach(loc -> {
                try {
                    messagingTemplate.convertAndSendToUser(
                            userId.toString(),
                            "/queue/location/nearby",
                            loc
                    );
                    System.out.println("📤 근처 사용자 정보 전송 완료: " + loc.getUserName() + " -> " + userId);
                } catch (Exception e) {
                    System.err.println("❌ 근처 사용자 정보 전송 실패: " + e.getMessage());
                }
            });
        } catch (Exception e) {
            System.err.println("❌ 근처 사용자 조회 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // 두 지점 간 거리 계산 (km)
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // 지구 반지름 (km)

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    // 현재 활성 사용자 수 조회
    public int getActiveUsersCount() {
        int count = activeLocations.size();
        System.out.println("📊 현재 활성 사용자 수: " + count);
        return count;
    }

    // 특정 사용자의 위치 정보 조회
    public LocationShareDTO getUserLocation(UUID userId) {
        LocationShareDTO location = activeLocations.get(userId);
        System.out.println("📍 사용자 위치 조회: " + userId + " -> " + (location != null ? "발견" : "없음"));
        return location;
    }
}
