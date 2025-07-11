package com.mega.haksamate.controller;

import com.mega.haksamate.dto.ItemCompleteDTO;
import com.mega.haksamate.dto.ItemRegisterRequestDTO;
import com.mega.haksamate.dto.ItemResponseDTO;
import com.mega.haksamate.dto.ItemSuggestionDTO;
import com.mega.haksamate.entity.ChatRoom;
import com.mega.haksamate.entity.Item;
import com.mega.haksamate.repository.ChatRoomRepository;
import com.mega.haksamate.repository.ItemRepository;
import com.mega.haksamate.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final ItemRepository itemRepository;
    private final ChatRoomRepository chatRoomRepository;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> registerItem(
            @RequestPart("item") ItemRegisterRequestDTO requestDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        Long itemId = itemService.saveItemWithImages(requestDTO, images);
        Map<String, Object> response = new HashMap<>();
        response.put("itemid", itemId);
        response.put("message", "상품이 성공적으로 등록되었습니다.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponseDTO> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemResponseById(id));
    }

    @GetMapping
    public ResponseEntity<List<ItemResponseDTO>> getAllItems() {
        return ResponseEntity.ok(itemService.getAllItems());
    }

    @GetMapping("/mine")
    public ResponseEntity<List<ItemResponseDTO>> getMyItems(@RequestParam UUID userId) {
        return ResponseEntity.ok(itemService.getItemsBySellerId(userId));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> updateItem(
            @PathVariable Long id,
            @RequestPart("item") ItemRegisterRequestDTO requestDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        itemService.updateItem(id, requestDTO, images);
        Map<String, Object> response = new HashMap<>();
        response.put("itemid", id);
        response.put("message", "게시글이 성공적으로 수정되었습니다.");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "게시글이 삭제되었습니다.");
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateItemStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        itemService.updateItemStatus(id, status);
        Map<String, String> response = new HashMap<>();
        response.put("message", "게시글 상태가 성공적으로 변경되었습니다.");
        return ResponseEntity.ok(response);
    }
    @PatchMapping("/{itemId}/reserve")
    public ResponseEntity<?> reserveItemToBuyer(
            @PathVariable Long itemId,
            @RequestBody Map<String, String> body
    ) {
        UUID buyerId = UUID.fromString(body.get("buyerId"));

        itemService.reserveItem(itemId, buyerId);

        return ResponseEntity.ok(Map.of("message", "상품이 예약 처리되었습니다."));
    }
    // ✅ 거래 완료 처리
    @PostMapping("/{itemId}/complete")
    public ResponseEntity<?> completeItemDeal(
            @PathVariable Long itemId
    ) {
        System.out.println("📩 거래 완료 요청: itemId=" + itemId );

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("해당 상품이 없습니다."));

        // 구매자 등록 및 상태 변경
        item.setStatus(Item.Status.거래완료);
        item.setCompletedDate(LocalDateTime.now());

        itemRepository.save(item);

        return ResponseEntity.ok("거래 완료 처리되었습니다.");
    }
    @GetMapping("/{itemId}/complete-info")
    public ResponseEntity<ItemCompleteDTO> getItemCompleteInfo(@PathVariable Long itemId) {
        Item item = itemService.getCompletedItemByItemId(itemId); // ✅ 단수
        return ResponseEntity.ok(ItemCompleteDTO.from(item));
    }
    // ✨ 구매자 거래완료 목록
    @GetMapping("/completed")
    public ResponseEntity<List<ItemCompleteDTO>> getCompletedItemsByBuyer(@RequestParam UUID userId) {
        return ResponseEntity.ok(itemService.getCompletedItemsByBuyer(userId));
    }

    @GetMapping("/suggest")
    public ResponseEntity<List<ItemSuggestionDTO>> getSuggestions(@RequestParam String keyword) {
        return ResponseEntity.ok(itemService.getItemSuggestionsWithImage(keyword));
    }
    // ✅ 판매자 ID로 게시글 조회
    @GetMapping("/by-seller")
    public ResponseEntity<List<ItemResponseDTO>> getItemsBySeller(@RequestParam UUID sellerId) {
        return ResponseEntity.ok(itemService.getItemsBySeller(sellerId));
    }



}
