package com.mega.haksamate.service;

import com.mega.haksamate.dto.ReviewRequestDTO;
import com.mega.haksamate.dto.ReviewResponseDTO;
import com.mega.haksamate.dto.ReviewSummaryDTO;
import com.mega.haksamate.entity.Item;
import com.mega.haksamate.entity.ItemTransaction;
import com.mega.haksamate.entity.Profile;
import com.mega.haksamate.entity.Review;
import com.mega.haksamate.repository.ItemRepository;
import com.mega.haksamate.repository.ItemTransactionRepository;
import com.mega.haksamate.repository.ProfileRepository;
import com.mega.haksamate.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ItemRepository itemRepository;
    private final ProfileRepository profileRepository;
    private final ItemTransactionRepository itemTransactionRepository;

    public List<ReviewSummaryDTO> getReviewSummariesBySeller(UUID sellerId) {
        return reviewRepository.findReviewSummariesBySellerId(sellerId);
    }

    public List<ReviewResponseDTO> getReviewsBySellerDetailed(UUID sellerId) {
        List<Review> reviews = reviewRepository.findByReviewee_IdOrderByCreatedAtDesc(sellerId);
        return reviews.stream()
                .map(ReviewResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }


    public void createReview(ReviewRequestDTO dto) {
        Item item = itemRepository.findById(dto.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        Profile buyer = profileRepository.findById(dto.getBuyerId())
                .orElseThrow(() -> new IllegalArgumentException("Buyer not found"));
        Profile reviewee = profileRepository.findById(dto.getRevieweeId())
                .orElseThrow(() -> new IllegalArgumentException("Reviewee not found"));
        ItemTransaction transaction = itemTransactionRepository.findById(dto.getTransactionId())
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if (reviewRepository.existsByItemAndBuyer(item, buyer)) {
            throw new IllegalStateException("이미 리뷰를 작성했습니다.");
        }

        Review review = new Review();
        review.setItem(item);
        review.setBuyer(buyer);
        review.setReviewee(reviewee);
        review.setReviewer(buyer);
        review.setTransaction(transaction);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());

        reviewRepository.save(review);
    }
}
