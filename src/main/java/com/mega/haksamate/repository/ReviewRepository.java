package com.mega.haksamate.repository;

import com.mega.haksamate.entity.Item;
import com.mega.haksamate.entity.Profile;
import com.mega.haksamate.entity.Review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.mega.haksamate.dto.ReviewSummaryDTO;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByItemAndBuyer(Item item, Profile buyer);

    // ✅ 상세 리뷰용 (Reviewer 이름, 아이템 제목 등 필요할 때)
    List<Review> findByReviewee_IdOrderByCreatedAtDesc(UUID sellerId);
    // ✅ 후기 개수 계산용

    @Query("SELECT new com.mega.haksamate.dto.ReviewSummaryDTO(r.comment, r.rating, r.createdAt, u.name, i.title) " +
            "FROM Review r " +
            "JOIN r.reviewer u " +
            "JOIN r.item i " +
            "WHERE r.reviewee.id = :sellerId " +
            "ORDER BY r.createdAt DESC")
    List<ReviewSummaryDTO> findReviewSummariesBySellerId(@Param("sellerId") UUID sellerId);

}