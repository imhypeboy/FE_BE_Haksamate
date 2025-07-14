package com.mega.haksamate.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Data
public class ReviewRequestDTO {
    private Long itemId;
    private UUID buyerId;
    private UUID revieweeId;
    private Long transactionId; // ← 꼭 Long으로!
    private int rating;
    private String comment;
}
