package com.mega.haksamate.controller;

import com.mega.haksamate.dto.FavoriteItemDTO;
import com.mega.haksamate.service.ItemLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/likes")
public class ItemLikeController {

    private final ItemLikeService itemLikeService;

    // 좋아요 추가 (응답은 Void, 프론트는 likeCount 직접 요청해서 반영)
    @PostMapping("/{itemId}")
    public ResponseEntity<Void> like(@PathVariable Long itemId, @RequestParam UUID userId) {
        itemLikeService.likeItem(itemId, userId);
        return ResponseEntity.ok().build();
    }

    // 좋아요 취소 (응답은 Void)
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> unlike(@PathVariable Long itemId, @RequestParam UUID userId) {
        itemLikeService.unlikeItem(itemId, userId);
        return ResponseEntity.ok().build();
    }

    // 좋아요 개수 조회
    @GetMapping("/{itemId}/count")
    public ResponseEntity<Long> count(@PathVariable Long itemId) {
        return ResponseEntity.ok(itemLikeService.countLikes(itemId));
    }

    // 특정 유저가 좋아요 눌렀는지 조회
    @GetMapping("/{itemId}/is-liked")
    public ResponseEntity<Boolean> isLiked(@PathVariable Long itemId, @RequestParam UUID userId) {
        return ResponseEntity.ok(itemLikeService.isLiked(itemId, userId));
    }

    // 특정 유저의 좋아요 목록
    @GetMapping("/my")
    public ResponseEntity<List<FavoriteItemDTO>> myFavorites(@RequestParam UUID userId) {
        return ResponseEntity.ok(itemLikeService.getUserFavorites(userId));
    }

}
