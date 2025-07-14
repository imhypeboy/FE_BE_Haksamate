package com.mega.haksamate.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageDTO {
    private Long chatRoomId;
    private UUID senderId;
    private String content;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") // ISO 형식
    private LocalDateTime sentAt;
}

