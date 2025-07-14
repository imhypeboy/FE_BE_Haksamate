package com.mega.haksamate.service;

import com.mega.haksamate.entity.Item;
import com.mega.haksamate.entity.ItemTransaction;
import com.mega.haksamate.entity.Profile;
import com.mega.haksamate.repository.ItemRepository;
import com.mega.haksamate.repository.ItemTransactionRepository;
import com.mega.haksamate.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ItemTransactionService {

    private final ItemTransactionRepository itemTransactionRepository;
    private final ItemRepository itemRepository;
    private final ProfileRepository profileRepository;

    public ItemTransaction createTransaction(UUID buyerId, UUID sellerId, Long itemId) {
        Profile buyer = profileRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("구매자 정보가 없습니다."));
        Profile seller = profileRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("판매자 정보가 없습니다."));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("상품 정보를 찾을 수 없습니다."));

        ItemTransaction transaction = ItemTransaction.builder()
                .item(item)
                .profile(buyer) // 구매자
                .distinctSeller(seller.getId()) // 판매자 UUID
                .status(ItemTransaction.TransactionStatus.대기중)  // enum 사용
                .build();

        return itemTransactionRepository.save(transaction);
    }
    public void updateStatus(Long id, ItemTransaction.TransactionStatus status) {
        ItemTransaction tx = itemTransactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("거래 내역 없음"));
        tx.setStatus(status);
        itemTransactionRepository.save(tx);
    }

    @Transactional
    public void confirmTransaction(Long transactionId) {
        // 1. 현재 확정할 거래 가져오기
        ItemTransaction confirmedTransaction = itemTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("거래가 존재하지 않습니다."));

        // 2. 해당 거래의 itemId 가져오기
        Long itemId = confirmedTransaction.getItem().getItemid();

        // 3. itemId를 기반으로 모든 거래 조회
        List<ItemTransaction> allTransactions = itemTransactionRepository.findAllByItem_Itemid(itemId);

        for (ItemTransaction tx : allTransactions) {
            if (tx.getTransactionid().equals(transactionId)) {
                tx.setStatus(ItemTransaction.TransactionStatus.확정됨);
            } else {
                tx.setStatus(ItemTransaction.TransactionStatus.거절됨);
            }
        }

        itemTransactionRepository.saveAll(allTransactions);
    }
}
