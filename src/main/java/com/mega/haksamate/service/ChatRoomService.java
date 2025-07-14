package com.mega.haksamate.service;

import com.mega.haksamate.dto.ChatRoomResponseDTO;
import com.mega.haksamate.dto.ChatRoomWithLastMessageDTO;
import com.mega.haksamate.entity.ChatMessage;
import com.mega.haksamate.entity.ChatRoom;
import com.mega.haksamate.entity.Profile;
import com.mega.haksamate.repository.ChatMessageRepository;
import com.mega.haksamate.repository.ChatRoomRepository;
import com.mega.haksamate.repository.ProfileRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ProfileRepository profileRepository;

    /**
     * 1:1 채팅방 생성(이미 존재하면 반환)
     */
    public ChatRoomResponseDTO createChatRoom(UUID chatusr1Id, UUID chatusr2Id) {
        // 1. 두 사람이 이미 참여중인 방이 있는지 먼저 검색 (순서 상관없이)
        ChatRoom room = chatRoomRepository
                .findByChatUsr1Id_IdAndChatUsr2Id_Id(chatusr1Id, chatusr2Id)
                .orElseGet(() -> {
                    Profile user1 = profileRepository.findById(chatusr1Id)
                            .orElseThrow(() -> new RuntimeException("user1 정보를 찾을 수 없습니다."));
                    Profile user2 = profileRepository.findById(chatusr2Id)
                            .orElseThrow(() -> new RuntimeException("user2 정보를 찾을 수 없습니다."));
                    return chatRoomRepository.save(ChatRoom.builder()
                            .chatUsr1Id(user1)
                            .chatUsr2Id(user2)
                            .createdAt(System.currentTimeMillis())
                            .build());
                });

        return new ChatRoomResponseDTO(
                room.getChatRoomId(),
                room.getChatUsr1Id().getId(),
                room.getChatUsr1Id().getName(),
                room.getChatUsr2Id().getName(),
                room.getChatUsr2Id().getId(),
                room.getCreatedAt()

        );
    }

    /**
     * 유저가 참여중인 모든 채팅방 조회
     */
    public List<ChatRoomWithLastMessageDTO> getChatRoomsByUser(UUID userId) {
        // user1, user2 둘 중 하나로 참여한 모든 방 검색
        List<ChatRoom> rooms = chatRoomRepository.findByChatUsr1Id_IdOrChatUsr2Id_Id(userId, userId);

        return rooms.stream()
                .map(room -> {
                    // 1. 해당 채팅방의 최신 메시지 1건 조회 (없으면 null)
                    ChatMessage lastMessage = chatMessageRepository.findTop1ByChatRoomOrderBySentAtDesc(room);
                    // unreadCount
                    int unreadCount = chatMessageRepository.countUnreadByChatRoomAndUser(room.getChatRoomId(), userId);

                    return new ChatRoomWithLastMessageDTO(
                            room.getChatRoomId(),
                            room.getChatUsr1Id().getId(),
                            room.getChatUsr1Id().getName(),
                            room.getChatUsr2Id().getName(),
                            room.getChatUsr2Id().getId(),
                            room.getCreatedAt(),
                            lastMessage != null ? lastMessage.getContent() : null,
                            lastMessage != null && lastMessage.getSentAt() != null
                                    ? lastMessage.getSentAt().toEpochSecond(java.time.ZoneOffset.UTC)
                                    : null,
                            unreadCount
                    );
                })
                .collect(Collectors.toList());
    }
    /**
     * 단일 채팅방 상세 조회
     */
    public ChatRoom getChatRoomById(Long chatRoomId) {
        return chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
    }

    /**
     * 채팅방 삭제
     */
    @Transactional
    public void deleteChatRoom(Long chatRoomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));
        // 메시지 모두 삭제
        chatMessageRepository.deleteAllByChatRoom_ChatRoomId(chatRoomId);
        chatRoomRepository.delete(chatRoom);
    }
}
