package org.example.yourlist.domain.item.service;

import lombok.RequiredArgsConstructor;
import org.example.yourlist.domain.item.dto.ItemDto;
import org.example.yourlist.domain.item.entity.Item;
import org.example.yourlist.domain.item.mapper.ItemMapper;
import org.example.yourlist.domain.item.repository.ItemRepository;
import org.example.yourlist.domain.list.entity.ShoppingList;
import org.example.yourlist.domain.list.repository.ShoppingListRepository;
import org.example.yourlist.domain.user.entity.User;
import org.example.yourlist.exception.ForbiddenException;
import org.example.yourlist.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final ShoppingListRepository shoppingListRepository;
    private final ItemMapper itemMapper;

    @Transactional
    public ItemDto.ItemResponse createItem(Long listId, ItemDto.CreateItemRequest request, User currentUser) {
        ShoppingList shoppingList = shoppingListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Shopping list not found with id: " + listId));

        boolean isOwner = shoppingList.getOwner().getId().equals(currentUser.getId());
        boolean isCollaborator = shoppingList.getShares().stream()
                .anyMatch(share -> share.getUser().getId().equals(currentUser.getId()));

        if (!isOwner && !isCollaborator) {
            throw new ForbiddenException("User does not have permission to add items to this list");
        }

        Item item = itemMapper.toEntity(request);
        item.setShoppingList(shoppingList);
        item.setCreatedAt(LocalDateTime.now());

        Item savedItem = itemRepository.save(item);

        return itemMapper.toResponse(savedItem);
    }
}
