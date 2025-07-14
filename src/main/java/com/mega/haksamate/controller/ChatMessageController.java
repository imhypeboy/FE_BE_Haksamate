package com.mega.haksamate.controller;

import com.mega.haksamate.dto.MessageResponseDTO;
import com.mega.haksamate.entity.ChatMessage;
import com.mega.haksamate.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat-messages")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    @PostMapping("/{chatRoomId}")
    public ResponseEntity<List<MessageResponseDTO>> getMessagesByChatRoom(@PathVariable Long chatRoomId) {
        List<ChatMessage> messages = chatMessageService.getMessagesByChatRoom(chatRoomId);
        List<MessageResponseDTO> dtos = messages.stream().map(msg ->
                MessageResponseDTO.builder()
                        .messageId(msg.getMessageId())
                        .chatRoomId(msg.getChatRoom().getChatRoomId())
                        .senderId(msg.getSender().getId())
                        .content(msg.getContent())
                        .sentAt(msg.getSentAt())
                        .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}
