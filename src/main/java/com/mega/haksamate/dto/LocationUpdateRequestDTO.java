package com.mega.haksamate.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationUpdateRequestDTO {
    private UUID userId;
    private double latitude;
    private double longitude;
    private boolean visible; // isVisible 대신 visible 사용

    // 백워드 호환성을 위한 메서드
    public boolean isVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }
}
