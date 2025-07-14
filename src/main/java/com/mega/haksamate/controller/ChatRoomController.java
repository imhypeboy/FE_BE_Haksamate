package com.mega.haksamate.controller;

import com.mega.haksamate.dto.ChatRoomRequestDTO;
import com.mega.haksamate.dto.ChatRoomResponseDTO;
import com.mega.haksamate.dto.ChatRoomWithLastMessageDTO;
import com.mega.haksamate.entity.ChatRoom;
import com.mega.haksamate.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat-rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    @PostMapping
    public ResponseEntity<ChatRoomResponseDTO> createChatRoom(@RequestBody ChatRoomRequestDTO request) {
        ChatRoomResponseDTO response = chatRoomService.createChatRoom(
                request.getChatUsr1Id(),
                request.getChatUsr2Id()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ChatRoomWithLastMessageDTO>> getChatRoomsByUser(@RequestParam UUID userId) {
        List<ChatRoomWithLastMessageDTO> result = chatRoomService.getChatRoomsByUser(userId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{chatRoomId}")
    public ResponseEntity<ChatRoomResponseDTO> getChatRoomById(@PathVariable Long chatRoomId) {
        ChatRoom room = chatRoomService.getChatRoomById(chatRoomId);


        return ResponseEntity.ok(new ChatRoomResponseDTO(
                room.getChatRoomId(),
                room.getChatUsr2Id().getId(),
                room.getChatUsr1Id().getName(),
                room.getChatUsr2Id().getName(),
                room.getChatUsr1Id().getId(),
                room.getCreatedAt()
        ));
    }


    @DeleteMapping("/{chatRoomId}")
    public ResponseEntity<Void> deleteChatRoom(@PathVariable Long chatRoomId) {
        chatRoomService.deleteChatRoom(chatRoomId);
        return ResponseEntity.noContent().build();
    }
}
