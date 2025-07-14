package com.mega.haksamate.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ReportRequestDTO {
    private UUID reporterId;
    private UUID reportedId;
    private Long itemId; // nullable
    private String reason;
}
