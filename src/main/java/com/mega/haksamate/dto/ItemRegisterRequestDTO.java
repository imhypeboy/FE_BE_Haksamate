package com.mega.haksamate.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class ItemRegisterRequestDTO {
    private String title;
    private String description;
    private Integer price;
    private String category;
    private UUID sellerId;
    private List<String> itemImages; // 🔧 기존 이미지 경로 목록 (수정 시 사용)
    private MeetLocationDTO meetLocation;
    private String status; // 🔧 상태 필드 추가
}

