package com.mega.haksamate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LocationShareDTO {
    private UUID userId;
    private String userName;
    private double latitude;
    private double longitude;
    private LocalDateTime timestamp;
    private String status; // "online", "offline", "away"
    private boolean isVisible; // 위치 공개 여부
}
