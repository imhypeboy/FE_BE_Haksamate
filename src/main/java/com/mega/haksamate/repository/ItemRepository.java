package com.mega.haksamate.repository;

import com.mega.haksamate.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ItemRepository extends JpaRepository<Item, Long> {

    @Query("SELECT DISTINCT i FROM Item i " +
            "LEFT JOIN FETCH i.seller " +
            "LEFT JOIN FETCH i.itemImages")
    List<Item> findAllWithSellerAndImages();

    @Query("SELECT i FROM Item i " +
            "LEFT JOIN FETCH i.seller " +
            "LEFT JOIN FETCH i.itemImages " +
            "WHERE i.itemid = :id")
    Optional<Item> findItemWithSellerAndImagesById(@Param("id") Long id);

    @Query("SELECT DISTINCT i FROM Item i " +
            "LEFT JOIN FETCH i.seller s " +
            "LEFT JOIN FETCH i.itemImages " +
            "WHERE s.id = :userId")
    List<Item> findBySellerUserIdWithImages(@Param("userId") UUID userId);

    @Query("SELECT DISTINCT i FROM Item i " +
            "LEFT JOIN FETCH i.seller " +
            "LEFT JOIN FETCH i.itemImages " +
            "WHERE i.buyer.id = :buyerId AND i.status = '거래완료'")
    List<Item> findCompletedByBuyerUserId(@Param("buyerId") UUID buyerId);

    @Query("SELECT DISTINCT i FROM Item i " +
            "WHERE LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(i.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY i.regdate DESC")
    List<Item> findTop10ByKeyword(@Param("keyword") String keyword);

}
