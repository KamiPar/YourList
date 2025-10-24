package org.example.yourlist.domain.item.repository;

import org.example.yourlist.domain.item.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    Optional<Item> findByIdAndShoppingListId(Long id, Long shoppingListId);
}
