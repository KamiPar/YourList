package org.example.yourlist.domain.item.service;

import lombok.RequiredArgsConstructor;
import org.example.yourlist.domain.item.dto.ItemDto;
import org.example.yourlist.domain.item.entity.Item;
import org.example.yourlist.domain.item.mapper.ItemMapper;
import org.example.yourlist.domain.item.repository.ItemRepository;
import org.example.yourlist.domain.list.entity.ShoppingList;
import org.example.yourlist.domain.list.repository.ShoppingListRepository;
import org.example.yourlist.domain.list.service.ShoppingListService;
import org.example.yourlist.domain.user.entity.User;
import org.example.yourlist.exception.ForbiddenException;
import org.example.yourlist.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final ShoppingListRepository shoppingListRepository;
    private final ItemMapper itemMapper;
    private final ShoppingListService shoppingListService;

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

    @Transactional
    public ItemDto.ItemResponse updateItem(Long listId, Long itemId, ItemDto.UpdateItemRequest request, User currentUser) {
        if (request.name() == null && request.description() == null && request.isBought() == null) {
            throw new IllegalArgumentException("Request body must not be empty");
        }

        ShoppingList shoppingList = shoppingListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Shopping list not found with id: " + listId));

        boolean isOwner = shoppingList.getOwner().getId().equals(currentUser.getId());
        boolean isCollaborator = shoppingList.getShares().stream()
                .anyMatch(share -> share.getUser().getId().equals(currentUser.getId()));

        if (!isOwner && !isCollaborator) {
            throw new ForbiddenException("User does not have permission to modify this list");
        }

        Item item = itemRepository.findByIdAndShoppingListId(itemId, listId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId + " on list " + listId));

        if (request.name() != null) {
            item.setName(request.name());
        }
        if (request.description() != null) {
            item.setDescription(request.description());
        }
        if (request.isBought() != null) {
            item.setIsBought(request.isBought());
        }

        Item updatedItem = itemRepository.save(item);

        return itemMapper.toResponse(updatedItem);
    }

    @Transactional
    public void deleteItem(Long listId, Long itemId, User currentUser) {
        ShoppingList shoppingList = shoppingListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Shopping list not found with id: " + listId));

        boolean isOwner = shoppingList.getOwner().getId().equals(currentUser.getId());
        boolean isCollaborator = shoppingList.getShares().stream()
                .anyMatch(share -> share.getUser().getId().equals(currentUser.getId()));

        if (!isOwner && !isCollaborator) {
            throw new ForbiddenException("User does not have permission to delete this item");
        }

        Item item = itemRepository.findByIdAndShoppingListId(itemId, listId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId + " on list " + listId));

        itemRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public List<ItemDto.ItemWithListNameResponse> findAllItemsByListId(Long listId, User currentUser) {
        shoppingListService.checkAccess(listId, currentUser);
        return itemRepository.findAllWithListNameByShoppingListId(listId);
    }
}
