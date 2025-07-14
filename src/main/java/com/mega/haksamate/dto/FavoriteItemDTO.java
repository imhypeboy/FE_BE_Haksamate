package com.mega.haksamate.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FavoriteItemDTO {
    private Long itemid;
    private String title;
    private Integer price;
    private Long likeCount;
    private List<String> itemImages; // ✅ 추가!
}
