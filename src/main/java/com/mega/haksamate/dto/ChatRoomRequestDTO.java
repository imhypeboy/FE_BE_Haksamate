package com.mega.haksamate.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class ChatRoomRequestDTO {
    private UUID chatUsr1Id;
    private UUID chatUsr2Id;
}
