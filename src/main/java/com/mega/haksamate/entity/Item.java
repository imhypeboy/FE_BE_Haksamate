package com.mega.haksamate.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", referencedColumnName = "id")
    private Profile seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", referencedColumnName = "id")
    private Profile buyer;

    @Column(nullable = false)
    private String title;

    @Column(name = "meet_location_address")
    private String meetLocationAddress;

    @Column(name = "meet_location_lat")
    private Double meetLocationLat;

    @Column(name = "meet_location_lng")
    private Double meetLocationLng;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private int price;

    private String category;

    @Enumerated(EnumType.STRING)
    private Status status = Status.판매중;

    private Long regdate;

    @Column(name = "completed_date")
    private LocalDateTime completedDate;

    private String comment;

    private String thumbnail;


    @Builder.Default
    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemImage> itemImages = new ArrayList<>();

    public void addItemImage(ItemImage image) {
        this.itemImages.add(image);
        image.setItem(this);
    }

    public enum Status {
        판매중, 예약중, 거래완료
    }
    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Report> reports = new ArrayList<>();

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemLike> itemLikes = new ArrayList<>();

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemTransaction> itemTransactions = new ArrayList<>();
}
