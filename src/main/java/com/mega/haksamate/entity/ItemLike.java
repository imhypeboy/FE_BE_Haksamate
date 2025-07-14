package com.mega.haksamate.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "item_like", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"item_id", "user_id"})
})
@Getter
@Setter
public class ItemLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @ManyToOne
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile user;

    private LocalDateTime createdAt = LocalDateTime.now();
}
