package com.mega.haksamate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class SearchKeywordRequestDTO {
    private String keyword;
    private UUID userId;
}
