package com.mega.haksamate.repository;

import com.mega.haksamate.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {


    Optional<ChatRoom> findByChatUsr1Id_IdAndChatUsr2Id_Id(UUID chatusr1Id, UUID chatusr2Id);

    List<ChatRoom> findByChatUsr1Id_IdOrChatUsr2Id_Id(UUID userId, UUID userId1);
}
