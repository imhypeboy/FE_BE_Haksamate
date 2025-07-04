package com.mega.haksamate.service;

import com.mega.haksamate.dto.ItemRegisterRequestDTO;
import com.mega.haksamate.dto.ItemResponseDTO;
import com.mega.haksamate.dto.ItemSuggestionDTO;
import com.mega.haksamate.dto.MeetLocationDTO;
import com.mega.haksamate.entity.*;
import com.mega.haksamate.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemImageRepository itemImageRepository;
    private final ProfileRepository profileRepository;

    private final ItemTransactionRepository itemTransactionRepository;
    private final ItemLikeRepository itemLikeRepository;

    @PersistenceContext
    private EntityManager em;

    private final String UPLOAD_DIR = "./frontend/public/uploads";
    private final String THUMBNAIL_DIR = "./frontend/public/uploads/thumbnails";

    public Item getItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("해당 ID의 게시글이 존재하지 않습니다."));
    }

    public ItemResponseDTO getItemResponseById(Long id) {
        Item item = itemRepository.findItemWithSellerAndImagesById(id)
                .orElseThrow(() -> new NoSuchElementException("해당 ID의 게시글이 존재하지 않습니다."));
        return ItemResponseDTO.from(item);
    }

    public List<ItemResponseDTO> getAllItems() {
        return itemRepository.findAllWithSellerAndImages().stream()
                .map(ItemResponseDTO::from)
                .collect(Collectors.toList());
    }

    public List<ItemResponseDTO> getItemsBySellerId(UUID userId) {
        return itemRepository.findBySellerUserIdWithImages(userId).stream()
                .map(ItemResponseDTO::from)
                .collect(Collectors.toList());
    }

    public List<ItemResponseDTO> getItemsBySeller(UUID sellerId) {
        return getItemsBySellerId(sellerId);
    }

    public ItemResponseDTO toResponseDTO(Item item) {
        MeetLocationDTO meetLocation = null;
        if (item.getMeetLocationAddress() != null || item.getMeetLocationLat() != null || item.getMeetLocationLng() != null) {
            meetLocation = MeetLocationDTO.builder()
                    .address(item.getMeetLocationAddress())
                    .lat(item.getMeetLocationLat())
                    .lng(item.getMeetLocationLng())
                    .build();
        }

        return ItemResponseDTO.builder()
                .itemid(item.getItemid())
                .title(item.getTitle())
                .description(item.getDescription())
                .price(item.getPrice())
                .category(item.getCategory())
                .meetLocation(meetLocation)
                .regdate(String.valueOf(item.getRegdate()))
                .sellerId(item.getSeller() != null ? item.getSeller().getId() : null)
                .status(item.getStatus().name())
                .itemImages(item.getItemImages() != null
                        ? item.getItemImages().stream().map(ItemImage::getPhotoPath).toList()
                        : new ArrayList<>())
                .build();
    }

    public Long saveItemWithImages(ItemRegisterRequestDTO requestDTO, List<MultipartFile> images) {
        Profile seller = profileRepository.findById(requestDTO.getSellerId())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        // 선택적으로 MeetLocationDTO 만들고 싶다면 여기서 생성
        MeetLocationDTO location = requestDTO.getMeetLocation();

        Item item = Item.builder()
                .seller(seller)
                .title(requestDTO.getTitle())
                .description(requestDTO.getDescription())
                .price(requestDTO.getPrice())
                .category(requestDTO.getCategory())
                .status(Item.Status.판매중)
                .meetLocationAddress(location != null ? location.getAddress() : null)
                .meetLocationLat(location != null ? location.getLat() : null)
                .meetLocationLng(location != null ? location.getLng() : null)
                .regdate(System.currentTimeMillis())
                .build();

        saveImages(images, item);

        return itemRepository.save(item).getItemid();
    }

    // 🔧 수정 메서드 개선 - 기존 이미지 유지
    public void updateItem(Long itemId, ItemRegisterRequestDTO requestDTO, List<MultipartFile> images) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("해당 ID의 게시글이 존재하지 않습니다."));
        MeetLocationDTO location = requestDTO.getMeetLocation();

        // 기본 정보 업데이트
        item.setTitle(requestDTO.getTitle());
        item.setDescription(requestDTO.getDescription());
        item.setPrice(requestDTO.getPrice());
        item.setCategory(requestDTO.getCategory());
        item.setMeetLocationAddress(location != null ? location.getAddress() : null);
        item.setMeetLocationLat(location != null ? location.getLat() : null);
        item.setMeetLocationLng(location != null ? location.getLng() : null);

        // 🔧 상태 업데이트 추가 (requestDTO에 status 필드가 있다면)
        if (requestDTO.getStatus() != null) {
            try {
                item.setStatus(Item.Status.valueOf(requestDTO.getStatus()));
            } catch (IllegalArgumentException e) {
                System.err.println("⚠️ 잘못된 상태 값: " + requestDTO.getStatus());
            }
        }

        // 🔧 기존 이미지 처리 개선
        List<String> keepImagePaths = requestDTO.getItemImages(); // 프론트에서 보낸 유지할 이미지 목록

        if (keepImagePaths != null && !keepImagePaths.isEmpty()) {
            // 🔧 유지할 이미지만 남기고 나머지는 삭제
            List<ItemImage> imagesToRemove = item.getItemImages().stream()
                    .filter(img -> !keepImagePaths.contains(img.getPhotoPath()))
                    .collect(Collectors.toList());

            // 삭제할 이미지들의 파일도 함께 삭제
            for (ItemImage img : imagesToRemove) {
                deleteImageFile(img.getPhotoPath());
                item.getItemImages().remove(img);
                itemImageRepository.delete(img);
            }

            System.out.println("✅ 기존 이미지 " + keepImagePaths.size() + "개 유지, " + imagesToRemove.size() + "개 삭제");
        } else {
            // 🔧 유지할 이미지 목록이 없으면 모든 기존 이미지 삭제
            for (ItemImage img : item.getItemImages()) {
                deleteImageFile(img.getPhotoPath());
            }
            item.getItemImages().clear();
            System.out.println("⚠️ 모든 기존 이미지 삭제됨");
        }

        // 🔧 새로운 이미지 추가
        if (images != null && !images.isEmpty()) {
            saveImages(images, item);
            System.out.println("✅ 새로운 이미지 " + images.size() + "개 추가");
        }
    }

    // 🔧 이미지 파일 삭제 헬퍼 메서드
    private void deleteImageFile(String photoPath) {
        try {
            if (photoPath != null && photoPath.startsWith("/uploads/")) {
                String filename = photoPath.substring(photoPath.lastIndexOf("/") + 1);
                Files.deleteIfExists(Paths.get(UPLOAD_DIR, filename));
                Files.deleteIfExists(Paths.get(THUMBNAIL_DIR, "thumb_" + filename));
                System.out.println("🗑️ 이미지 파일 삭제: " + filename);
            }
        } catch (IOException e) {
            System.err.println("❌ 이미지 파일 삭제 실패: " + e.getMessage());
        }
    }

    private void saveImages(List<MultipartFile> images, Item item) {
        if (images == null || images.isEmpty()) return;

        Path uploadPath = Paths.get(UPLOAD_DIR);
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("디렉토리 생성 실패: " + e.getMessage());
        }

        for (MultipartFile file : images) {
            try {
                String ext = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
                String saveFileName = UUID.randomUUID().toString().replace("-", "") + ext;
                Path filePath = uploadPath.resolve(saveFileName);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                ItemImage image = ItemImage.builder()
                        .photoPath("/uploads/" + saveFileName)
                        .regdate(LocalDateTime.now())
                        .build();
                item.addItemImage(image);
            } catch (IOException e) {
                throw new RuntimeException("이미지 저장 실패: " + e.getMessage());
            }
        }
    }

    public void deleteItem(Long itemId) {
        itemLikeRepository.deleteByItemId(itemId);

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("해당 ID의 게시글이 존재하지 않습니다."));

        for (ItemImage img : item.getItemImages()) {
            deleteImageFile(img.getPhotoPath());
        }

        List<ItemTransaction> transactions = itemTransactionRepository.findAllByItem_Itemid(itemId);
        itemTransactionRepository.deleteAll(transactions);
        itemImageRepository.deleteAll(item.getItemImages());
        itemRepository.delete(item);
    }

    public void updateItemStatus(Long itemId, String status) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("해당 ID의 게시글이 존재하지 않습니다."));
        try {
            item.setStatus(Item.Status.valueOf(status));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("유효하지 않은 상태 값입니다: " + status);
        }
    }

    public List<ItemResponseDTO> getCompletedItemsByBuyer(UUID buyerId) {
        return itemRepository.findCompletedByBuyerUserId(buyerId).stream()
                .map(ItemResponseDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ItemSuggestionDTO> getItemSuggestionsWithImage(String keyword) {
        return itemRepository.findTop10ByKeyword(keyword).stream()
                .map(item -> new ItemSuggestionDTO(
                        item.getItemid(),
                        item.getTitle(),
                        item.getItemImages() != null && !item.getItemImages().isEmpty()
                                ? item.getItemImages().get(0).getPhotoPath()
                                : null
                )).toList();
    }
}
