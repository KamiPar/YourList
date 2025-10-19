package org.example.yourlist.domain.list.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.yourlist.domain.item.entity.Item;
import org.example.yourlist.domain.listshare.entity.ShoppingListShare;
import org.example.yourlist.domain.user.entity.User;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "shopping_lists")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class ShoppingList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "share_token", nullable = false, unique = true)
    private UUID shareToken;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "shoppingList", fetch = FetchType.LAZY)
    private Set<Item> items = new HashSet<>();

    @OneToMany(mappedBy = "shoppingList", fetch = FetchType.LAZY)
    private Set<ShoppingListShare> shares = new HashSet<>();

}
