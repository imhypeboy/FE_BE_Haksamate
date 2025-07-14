package com.mega.haksamate.repository;

import com.mega.haksamate.entity.Item;
import com.mega.haksamate.entity.ItemLike;
import com.mega.haksamate.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ItemLikeRepository extends JpaRepository<ItemLike, Long> {
    Optional<ItemLike> findByItemAndUser(Item item, Profile user);
    Long countByItem(Item item);
    List<ItemLike> findByUser(Profile user);
    boolean existsByItemAndUser(Item item, Profile user);
    void deleteByItemAndUser(Item item, Profile user);

    @Modifying
    @Query("DELETE FROM ItemLike il WHERE il.item.itemid = :itemid")
    void deleteByItemId(@Param("itemid") Long itemid);
}
