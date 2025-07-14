package com.mega.haksamate.dto;

import lombok.Getter;

@Getter
public class ItemStatusUpdateDTO {
    private String status; // "판매중", "예약중", "거래완료"
}
