package com.mega.haksamate.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "chat_room")
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chatroomid")
    private Long chatRoomId;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chatusr1_id",referencedColumnName = "id", nullable = false)
    private Profile chatUsr1Id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chatusr2_id", referencedColumnName = "id",nullable = false)
    private Profile chatUsr2Id;

    @Column(name = "created_at")
    private Long createdAt;
}
