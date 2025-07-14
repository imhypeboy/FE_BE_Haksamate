package com.mega.haksamate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ItemSuggestionDTO {
    private Long itemId;
    private String title;
    private String thumbnail; // 썸네일 경로
}
