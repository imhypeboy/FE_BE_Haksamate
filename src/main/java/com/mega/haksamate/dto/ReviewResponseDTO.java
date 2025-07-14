// ReviewResponseDTO.java
package com.mega.haksamate.dto;

import com.mega.haksamate.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class ReviewResponseDTO {
    private int rating;
    private String comment;
    private String reviewerNickname;
    private UUID reviewerId; // ✅ 추가
    private LocalDateTime createdAt;
    private String itemTitle; // ← 추가

    public static ReviewResponseDTO fromEntity(Review review) {
        return ReviewResponseDTO.builder()
                .rating(review.getRating())
                .comment(review.getComment())
                .reviewerNickname(review.getReviewer().getName())
                .reviewerId(review.getReviewer().getId()) // ✅ 추가
                .itemTitle(review.getItem().getTitle()) // ← 추가
                .createdAt(review.getCreatedAt())
                .build();
    }
}
