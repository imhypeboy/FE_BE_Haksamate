package com.mega.haksamate.repository;

import com.mega.haksamate.dto.ChatRoomResponseDTO;
import com.mega.haksamate.dto.ChatRoomWithLastMessageDTO;
import com.mega.haksamate.entity.ChatMessage;
import com.mega.haksamate.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatRoom_ChatRoomIdOrderBySentAtAsc(Long chatroomid);

    // ✅ 추가
    void deleteAllByChatRoom_ChatRoomId(Long chatroomid);

    ChatMessage findTop1ByChatRoomOrderBySentAtDesc(ChatRoom chatRoom);

    @Query("""
SELECT COUNT(m) FROM ChatMessage m
WHERE m.chatRoom.chatRoomId = :chatRoomId
  AND m.sender.id <> :myUserId
  AND (m.isRead = false OR m.isRead IS NULL)
""")
    int countUnreadByChatRoomAndUser(@Param("chatRoomId") Long chatRoomId, @Param("myUserId") UUID myUserId);

}
