package org.example.yourlist.domain.item.service;

import org.example.yourlist.domain.item.dto.ItemDto;
import org.example.yourlist.domain.item.entity.Item;
import org.example.yourlist.domain.item.mapper.ItemMapper;
import org.example.yourlist.domain.item.repository.ItemRepository;
import org.example.yourlist.domain.list.entity.ShoppingList;
import org.example.yourlist.domain.list.repository.ShoppingListRepository;
import org.example.yourlist.domain.user.entity.User;
import org.example.yourlist.exception.ForbiddenException;
import org.example.yourlist.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItemServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private ShoppingListRepository shoppingListRepository;

    @Mock
    private ItemMapper itemMapper;

    @InjectMocks
    private ItemService itemService;

    private User listOwner;
    private ShoppingList shoppingList;
    private Item item;
    private ItemDto.CreateItemRequest createItemRequest;
    private ItemDto.ItemResponse itemResponse;

    @BeforeEach
    void setUp() {
        listOwner = new User();
        listOwner.setId(1L);

        shoppingList = new ShoppingList();
        shoppingList.setId(1L);
        shoppingList.setOwner(listOwner);
        shoppingList.setShares(Collections.emptySet());

        createItemRequest = new ItemDto.CreateItemRequest("Milk", "2L");

        item = new Item();
        item.setId(1L);
        item.setName("Milk");
        item.setDescription("2L");
        item.setShoppingList(shoppingList);
        item.setCreatedAt(LocalDateTime.now());

        itemResponse = new ItemDto.ItemResponse(1L, 1L, "Milk", "2L", false, item.getCreatedAt());
    }

    @Test
    void createItem_shouldCreateItem_whenUserIsOwner() {
        when(shoppingListRepository.findById(1L)).thenReturn(Optional.of(shoppingList));
        when(itemMapper.toEntity(createItemRequest)).thenReturn(item);
        when(itemRepository.save(any(Item.class))).thenReturn(item);
        when(itemMapper.toResponse(item)).thenReturn(itemResponse);

        ItemDto.ItemResponse result = itemService.createItem(1L, createItemRequest, listOwner);

        assertNotNull(result);
        assertEquals("Milk", result.name());
        verify(shoppingListRepository, times(1)).findById(1L);
        verify(itemRepository, times(1)).save(any(Item.class));
    }

    @Test
    void createItem_shouldThrowResourceNotFoundException_whenListNotFound() {
        when(shoppingListRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> itemService.createItem(1L, createItemRequest, listOwner));

        verify(itemRepository, never()).save(any(Item.class));
    }

    @Test
    void createItem_shouldThrowForbiddenException_whenUserIsNotOwnerOrCollaborator() {
        User anotherUser = new User();
        anotherUser.setId(2L);

        when(shoppingListRepository.findById(1L)).thenReturn(Optional.of(shoppingList));

        assertThrows(ForbiddenException.class, () -> itemService.createItem(1L, createItemRequest, anotherUser));

        verify(itemRepository, never()).save(any(Item.class));
    }
}
