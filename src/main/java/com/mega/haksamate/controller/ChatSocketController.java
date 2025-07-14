package com.mega.haksamate.controller;

import com.mega.haksamate.dto.MessageDTO;
import com.mega.haksamate.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatSocketController {

    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageDTO messageDTO) {
        System.out.println("📨 받은 메시지 DTO: " + messageDTO);
        chatMessageService.sendMessage(messageDTO);
    }
}
