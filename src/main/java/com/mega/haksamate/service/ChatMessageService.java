package com.mega.haksamate.service;

import com.mega.haksamate.dto.MessageDTO;
import com.mega.haksamate.entity.ChatMessage;
import com.mega.haksamate.entity.ChatRoom;
import com.mega.haksamate.entity.Profile;
import com.mega.haksamate.repository.ChatMessageRepository;
import com.mega.haksamate.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomService chatRoomService;
    private final ProfileRepository profileRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void sendMessage(MessageDTO dto) {
        ChatRoom chatRoom = chatRoomService.getChatRoomById(dto.getChatRoomId());
        Profile sender = profileRepository.findById(dto.getSenderId())
                .orElseThrow(() -> new RuntimeException("보낸 사람을 찾을 수 없습니다"));

        ChatMessage message = ChatMessage.builder()
                .chatRoom(chatRoom)
                .sender(sender)
                .content(dto.getContent())
                .sentAt(LocalDateTime.now())
                .isRead(false)
                .build();

        ChatMessage saved = chatMessageRepository.save(message);

        // ✅ sentAt 포함된 DTO로 새로 구성해서 전송
        MessageDTO responseDTO = new MessageDTO();
        responseDTO.setChatRoomId(saved.getChatRoom().getChatRoomId());
        responseDTO.setSenderId(saved.getSender().getId());
        responseDTO.setContent(saved.getContent());
        responseDTO.setSentAt(saved.getSentAt()); // ✅ 이게 중요

        messagingTemplate.convertAndSend("/topic/chat/" + dto.getChatRoomId(), responseDTO);
    }


    public List<ChatMessage> getMessagesByChatRoom(Long chatRoomId) {
        return chatMessageRepository.findByChatRoom_ChatRoomIdOrderBySentAtAsc(chatRoomId);
    }
}
