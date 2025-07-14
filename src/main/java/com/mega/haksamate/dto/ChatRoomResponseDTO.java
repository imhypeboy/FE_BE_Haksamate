package com.mega.haksamate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class ChatRoomResponseDTO {
    private Long chatroomId;
    private UUID chatUsr1Id;
    private String chatUsr1Name;
    private String chatUsr2Name;
    private UUID chatUsr2Id;
    private Long createdAt;


}