package com.mega.haksamate.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class TransactionRequestDTO {
    private UUID buyerId;
    private UUID sellerId;
    private Long itemId;
}
