package com.mega.haksamate.controller;

import com.mega.haksamate.dto.ReviewRequestDTO;
import com.mega.haksamate.dto.ReviewResponseDTO;
import com.mega.haksamate.dto.ReviewSummaryDTO;
import com.mega.haksamate.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReviewRequestDTO dto) {
        reviewService.createReview(dto);
        Map<String, String> result = new HashMap<>();
        result.put("message", "리뷰가 저장되었습니다.");
        return ResponseEntity.ok(result); // JSON 형태 응답
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<ReviewSummaryDTO>> getReviewsBySeller(@PathVariable UUID sellerId) {
        List<ReviewSummaryDTO> reviews = reviewService.getReviewSummariesBySeller(sellerId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/seller/{sellerId}/detailed")
    public ResponseEntity<List<ReviewResponseDTO>> getDetailedReviews(@PathVariable UUID sellerId) {
        List<ReviewResponseDTO> reviews = reviewService.getReviewsBySellerDetailed(sellerId);
        return ResponseEntity.ok(reviews);
    }

}
