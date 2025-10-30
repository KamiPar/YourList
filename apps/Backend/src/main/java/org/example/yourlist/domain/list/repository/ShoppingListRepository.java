package org.example.yourlist.domain.list.repository;

import org.example.yourlist.domain.list.dto.ShoppingListSummaryResponse;
import org.example.yourlist.domain.list.entity.ShoppingList;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShoppingListRepository extends JpaRepository<ShoppingList, Long> {
  @Query(value = """
      SELECT new org.example.yourlist.domain.list.dto.ShoppingListSummaryResponse(
          sl.id,
          sl.name,
          sl.owner.id,
          (sl.owner.id = :userId),
          sl.shareToken,
          sl.createdAt,
          sl.updatedAt,
          (SELECT COUNT(i) FROM Item i WHERE i.shoppingList = sl),
          (SELECT COUNT(i) FROM Item i WHERE i.shoppingList = sl AND i.isBought = true)
      )
      FROM ShoppingList sl
      LEFT JOIN sl.shares sls
      WHERE sl.owner.id = :userId OR sls.user.id = :userId
      GROUP BY sl.id, sl.name, sl.owner.id, sl.shareToken, sl.createdAt, sl.updatedAt
      """,
      countQuery = """
      SELECT COUNT(DISTINCT sl.id)
      FROM ShoppingList sl
      LEFT JOIN sl.shares sls
      WHERE sl.owner.id = :userId OR sls.user.id = :userId
      """)
  Page<ShoppingListSummaryResponse> findAllForUser(@Param("userId") Long userId, Pageable pageable);

  @Query("SELECT sl FROM ShoppingList sl JOIN FETCH sl.owner WHERE sl.id = :id")
  Optional<ShoppingList> findByIdWithOwner(@Param("id") Long id);

  @Query("SELECT sl FROM ShoppingList sl JOIN FETCH sl.owner LEFT JOIN FETCH sl.shares WHERE sl.id = :id")
  Optional<ShoppingList> findByIdWithOwnerAndShares(@Param("id") Long id);
}
