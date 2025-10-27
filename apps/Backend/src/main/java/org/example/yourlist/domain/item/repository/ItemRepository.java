package org.example.yourlist.domain.item.repository;

import org.example.yourlist.domain.item.dto.ItemDto;
import org.example.yourlist.domain.item.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    Optional<Item> findByIdAndShoppingListId(Long id, Long shoppingListId);

    @Query("SELECT new org.example.yourlist.domain.item.dto.ItemDto$ItemWithListNameResponse(i.id, sl.id, sl.name, i.name, i.description, i.isBought, i.createdAt) FROM Item i JOIN i.shoppingList sl WHERE sl.id = :listId")
    List<ItemDto.ItemWithListNameResponse> findAllWithListNameByShoppingListId(@Param("listId") Long listId);
}
