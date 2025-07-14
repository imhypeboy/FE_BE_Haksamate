package com.mega.haksamate.controller;

import com.mega.haksamate.repository.ItemTransactionRepository;
import com.mega.haksamate.service.ItemTransactionService;
import com.mega.haksamate.dto.TransactionRequestDTO;
import com.mega.haksamate.entity.ItemTransaction;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class ItemTransactionController {

    private final ItemTransactionService itemTransactionService;
    private final ItemTransactionRepository itemTransactionRepository;

    @PostMapping
    public ResponseEntity<ItemTransaction> createTransaction(@RequestBody TransactionRequestDTO dto) {
        ItemTransaction transaction = itemTransactionService.createTransaction(
                dto.getBuyerId(), dto.getSellerId(), dto.getItemId());
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/{itemId}/requests")
    public ResponseEntity<List<Map<String, Object>>> getBuyerRequestsForItem(
            @PathVariable Long itemId,
            @RequestParam UUID sellerId) {

        // distinct_seller와 item_itemid 기준으로 거래 요청 조회
        List<ItemTransaction> transactions = itemTransactionRepository
                .findAllByItem_ItemidAndDistinctSeller(itemId, sellerId);

        // 결과 매핑
        List<Map<String, Object>> response = transactions.stream()
                .map(tx -> Map.<String, Object>of(
                        "transactionId", (Object) tx.getTransactionid(),
                        "buyerId", (Object) tx.getProfile().getId(),
                        "buyerName", (Object) tx.getProfile().getName(),
                        "status", (Object) tx.getStatus().toString()
                ))
                .toList();
        return ResponseEntity.ok(response);

    }
    @PostMapping("/{transactionId}/confirm")
    public ResponseEntity<?> confirm(@PathVariable Long transactionId) {
        itemTransactionService.confirmTransaction(transactionId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{transactionId}/reject")
    public ResponseEntity<?> reject(@PathVariable Long transactionId) {
        itemTransactionService.updateStatus(transactionId, ItemTransaction.TransactionStatus.거절됨);
        return ResponseEntity.ok().build();
    }

}
