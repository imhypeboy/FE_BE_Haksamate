package com.mega.haksamate.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;


@Data
@AllArgsConstructor
public class ChatRoomWithLastMessageDTO {
    private Long chatroomId;
    private UUID chatUsr1Id;
    private String chatUsr1Name;
    private String chatUsr2Name;
    private UUID chatUsr2Id;
    private Long createdAt;

    // 아래 필드 추가 (lastMessage 내용, 마지막 메시지 시간)
    private String lastMessage;
    private Long lastMessageTime;
    private Integer unreadCount;
}
