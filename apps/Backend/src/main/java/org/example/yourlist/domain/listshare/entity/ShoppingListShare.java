package org.example.yourlist.domain.listshare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.example.yourlist.domain.list.entity.ShoppingList;
import org.example.yourlist.domain.user.entity.User;

import java.io.Serializable;
@Entity
@Table(name = "shopping_list_shares")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class ShoppingListShare {

    @EmbeddedId
    private ShoppingListShareId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("listId")
    @JoinColumn(name = "shopping_list_id", nullable = false)
    private ShoppingList shoppingList;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Embedded ID class for composite primary key
    @Embeddable
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    @Setter
    @EqualsAndHashCode
    @ToString
    public static class ShoppingListShareId implements Serializable {

      @Column(name = "shopping_list_id")
      private Long listId;

      @Column(name = "user_id")
      private Long userId;

    }
}
