package com.mega.haksamate.service;

import com.mega.haksamate.dto.FavoriteItemDTO;
import com.mega.haksamate.entity.Item;
import com.mega.haksamate.entity.ItemLike;
import com.mega.haksamate.entity.Profile;
import com.mega.haksamate.repository.ItemLikeRepository;
import com.mega.haksamate.repository.ItemRepository;
import com.mega.haksamate.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ItemLikeService {

    private final ItemRepository itemRepository;
    private final ProfileRepository profileRepository;
    private final ItemLikeRepository itemLikeRepository;

    // 좋아요 추가
    @Transactional
    public void likeItem(Long itemId, UUID userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!itemLikeRepository.existsByItemAndUser(item, user)) {
            ItemLike like = new ItemLike();
            like.setItem(item);
            like.setUser(user);
            itemLikeRepository.save(like);
        }
    }

    // 좋아요 취소
    @Transactional
    public void unlikeItem(Long itemId, UUID userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        itemLikeRepository.findByItemAndUser(item, user)
                .ifPresent(itemLikeRepository::delete);
    }

    // 좋아요 여부
    public boolean isLiked(Long itemId, UUID userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return itemLikeRepository.existsByItemAndUser(item, user);
    }

    // 좋아요 개수
    public Long countLikes(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        return itemLikeRepository.countByItem(item);
    }

    // 특정 유저의 좋아요 목록
    public List<FavoriteItemDTO> getUserFavorites(UUID userId) {
        Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ItemLike> likes = itemLikeRepository.findByUser(user);

        return likes.stream()
                .map(like -> {
                    Item item = like.getItem();
                    Long count = itemLikeRepository.countByItem(item);
                    List<String> imagePaths = item.getItemImages().stream()
                            .map(image -> image.getPhotoPath())
                            .toList();

                    return new FavoriteItemDTO(
                            item.getItemid(),
                            item.getTitle(),
                            item.getPrice(),
                            count,
                            imagePaths
                    );
                })
                .toList();
    }
}
