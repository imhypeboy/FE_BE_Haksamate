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

    @GetMapping("/item/{itemId}/buyer/{userId}")
    public ResponseEntity<Map<String, Long>> getTransactionId(
            @PathVariable Long itemId,
            @PathVariable UUID userId) {

        List<ItemTransaction> transactions = itemTransactionRepository
                .findAllByItem_ItemidAndProfile_IdAndDistinctSellerNot(itemId, userId, userId);

        if (transactions.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", -1L));
        }

        // ✅ 여러 개 중 첫 번째만 사용
        Long transactionId = transactions.get(0).getTransactionid();
        return ResponseEntity.ok(Map.of("transactionId", transactionId));
    }
}
