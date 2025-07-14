package com.mega.haksamate.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private Profile reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_id", nullable = false)
    private Profile reported;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_itemid")
    private Item item;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    private Long regdate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    public enum Status {
        접수, 처리중, 완료
    }
}
