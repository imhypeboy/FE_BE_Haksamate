package com.mega.haksamate.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
@Data
public class MessageResponseDTO {
    private Long messageId;
    private Long chatRoomId;
    private UUID senderId;
    private String content;
    private LocalDateTime sentAt;
}
