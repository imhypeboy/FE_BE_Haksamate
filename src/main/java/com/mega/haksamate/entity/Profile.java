package com.mega.haksamate.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String department;
    private String studentId;
    private String year;
    private String profileImageUrl;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    // 연관관계 필드들 (관계 대상 엔티티명/필드명도 Profile 기준으로 전부 맞춰야 함)

    @OneToMany(mappedBy = "sender")
    private List<ChatMessage> sentMessages;


    // 내가 user1로 참여한 채팅방 목록
    @OneToMany(mappedBy = "chatUsr1Id")
    private List<ChatRoom> chatRoomsAsUser1;

    // 내가 user2로 참여한 채팅방 목록
    @OneToMany(mappedBy = "chatUsr2Id")
    private List<ChatRoom> chatRoomsAsUser2;

    @OneToMany(mappedBy = "seller")
    private List<Item> itemsAsSeller;

    @OneToMany(mappedBy = "buyer")
    private List<Item> itemsAsBuyer;

    @OneToMany(mappedBy = "profile")
    private List<ItemTransaction> transactions;

    @OneToMany(mappedBy = "reporter")
    private List<Report> reportsSent;

    @OneToMany(mappedBy = "reported")
    private List<Report> reportsReceived;

    @OneToMany(mappedBy = "blocker")
    private List<Block> blockedUsers;

    @OneToMany(mappedBy = "blocked")
    private List<Block> blockingUsers;

}