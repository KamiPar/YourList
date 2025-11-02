package org.example.yourlist.domain.listshare.repository;

import org.example.yourlist.domain.listshare.entity.ShoppingListShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShoppingListShareRepository extends JpaRepository<ShoppingListShare, ShoppingListShare.ShoppingListShareId> {

    /**
     * Checks if a share entry exists for a given shopping list and user.
     *
     * @param listId The ID of the shopping list.
     * @param userId The ID of the user.
     * @return {@code true} if a share entry exists, {@code false} otherwise.
     */
    boolean existsByShoppingListIdAndUserId(Long listId, Long userId);
}
