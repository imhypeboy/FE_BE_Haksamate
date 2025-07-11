package com.mega.haksamate.repository;

import com.mega.haksamate.entity.ItemTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ItemTransactionRepository extends JpaRepository<ItemTransaction, Long> {


    List<ItemTransaction> findAllByItem_Itemid(Long itemId);


    List<ItemTransaction> findAllByItem_ItemidAndProfile_IdAndDistinctSellerNot(Long itemId, UUID userId, UUID userId1);

    List<ItemTransaction> findAllByItem_ItemidAndDistinctSeller(Long itemId, UUID sellerId);

}
