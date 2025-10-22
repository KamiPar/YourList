package org.example.yourlist.domain.list.repository;

import org.example.yourlist.domain.list.entity.ShoppingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShoppingListRepository extends JpaRepository<ShoppingList, Long> {
}
