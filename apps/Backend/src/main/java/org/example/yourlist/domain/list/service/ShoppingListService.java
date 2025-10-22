package org.example.yourlist.domain.list.service;

import lombok.RequiredArgsConstructor;
import org.example.yourlist.domain.list.dto.ShoppingListDto;
import org.example.yourlist.domain.list.entity.ShoppingList;
import org.example.yourlist.domain.list.mapper.ShoppingListMapper;
import org.example.yourlist.domain.list.repository.ShoppingListRepository;
import org.example.yourlist.domain.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShoppingListService {
    private final ShoppingListRepository shoppingListRepository;
    private final ShoppingListMapper shoppingListMapper;

    @Transactional
    public ShoppingListDto.ShoppingListResponse createList(ShoppingListDto.CreateShoppingListRequest createShoppingListRequest, User currentUser) {
        ShoppingList shoppingList = ShoppingList.builder()
                .name(createShoppingListRequest.name())
                .owner(currentUser)
                .createdAt(LocalDateTime.now())
          .updatedAt(LocalDateTime.now())
          .shareToken(UUID.randomUUID())
                .build();
        ShoppingList savedShoppingList = shoppingListRepository.save(shoppingList);
        return shoppingListMapper.toShoppingListResponse(savedShoppingList);
    }
}
