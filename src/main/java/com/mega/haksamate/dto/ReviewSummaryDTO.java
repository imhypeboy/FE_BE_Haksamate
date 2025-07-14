package com.mega.haksamate.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewSummaryDTO {

    private String comment;
    private int rating;
    private LocalDateTime createdAt;
    private String reviewerNickname;
    private String itemTitle;

    public ReviewSummaryDTO(String comment, int rating, LocalDateTime createdAt, String reviewerUserid, String itemTitle) {
        this.comment = comment;
        this.rating = rating;
        this.createdAt = createdAt;
        this.reviewerNickname = reviewerUserid; // ✅ 변수명 일치하게 수정
        this.itemTitle = itemTitle;
    }

}
