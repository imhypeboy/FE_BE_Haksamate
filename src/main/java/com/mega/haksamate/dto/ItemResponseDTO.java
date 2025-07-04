package com.mega.haksamate.dto;

import com.mega.haksamate.entity.Item;
import com.mega.haksamate.entity.Profile;
import lombok.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemResponseDTO {

    private Long itemid;
    private String title;
    private String category;
    private String description;
    private int price;
    private String regdate;
    private MeetLocationDTO meetLocation;
    private UUID sellerId;
    private String sellerName; // ✅ 추가
    private List<String> itemImages;
    private String status;

    public static ItemResponseDTO from(Item item) {
        MeetLocationDTO location = null;
        if (item.getMeetLocationAddress() != null || item.getMeetLocationLat() != null || item.getMeetLocationLng() != null) {
            location = MeetLocationDTO.builder()
                    .address(item.getMeetLocationAddress())
                    .lat(item.getMeetLocationLat())
                    .lng(item.getMeetLocationLng())
                    .build();
        }

        Profile seller = item.getSeller();
        UUID sellerId = null;
        String sellerName = null;
        if (seller != null) {
            sellerId = seller.getId();
            sellerName = seller.getName();  // null일 수도 있음\
            System.out.println("nullnull"+sellerName);
        }else {
            System.out.println("nullnull");
        }


        return ItemResponseDTO.builder()
                .itemid(item.getItemid())
                .title(item.getTitle())
                .category(item.getCategory())
                .description(item.getDescription())
                .price(item.getPrice())
                .regdate(String.valueOf(item.getRegdate()))
                .meetLocation(location)
                .sellerId(sellerId)
                .sellerName(sellerName)
                .itemImages(item.getItemImages() != null
                        ? item.getItemImages().stream()
                        .map(image -> image.getPhotoPath())
                        .collect(Collectors.toList())
                        : List.of())
                .status(item.getStatus().name())
                .build();
    }
}
