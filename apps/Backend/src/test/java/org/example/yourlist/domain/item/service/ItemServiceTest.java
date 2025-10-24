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

    @Test
    void updateItem_shouldUpdateItem_whenUserIsOwner() {
        ItemDto.UpdateItemRequest updateRequest = new ItemDto.UpdateItemRequest("New Milk", "3L", true);
        when(shoppingListRepository.findById(1L)).thenReturn(Optional.of(shoppingList));
        when(itemRepository.findByIdAndShoppingListId(1L, 1L)).thenReturn(Optional.of(item));
        when(itemRepository.save(any(Item.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(itemMapper.toResponse(any(Item.class))).thenAnswer(invocation -> {
            Item savedItem = invocation.getArgument(0);
            return new ItemDto.ItemResponse(savedItem.getId(), savedItem.getShoppingList().getId(), savedItem.getName(), savedItem.getDescription(), savedItem.getIsBought(), savedItem.getCreatedAt());
        });

        ItemDto.ItemResponse result = itemService.updateItem(1L, 1L, updateRequest, listOwner);

        assertNotNull(result);
        assertEquals("New Milk", result.name());
        assertEquals("3L", result.description());
        assertTrue(result.isBought());
        verify(itemRepository, times(1)).save(any(Item.class));
    }

    @Test
    void updateItem_shouldThrowIllegalArgumentException_whenRequestIsEmpty() {
        ItemDto.UpdateItemRequest updateRequest = new ItemDto.UpdateItemRequest(null, null, null);
        assertThrows(IllegalArgumentException.class, () -> itemService.updateItem(1L, 1L, updateRequest, listOwner));
    }

    @Test
    void updateItem_shouldThrowResourceNotFoundException_whenItemNotFound() {
        ItemDto.UpdateItemRequest updateRequest = new ItemDto.UpdateItemRequest("New Name", null, null);
        when(shoppingListRepository.findById(1L)).thenReturn(Optional.of(shoppingList));
        when(itemRepository.findByIdAndShoppingListId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> itemService.updateItem(1L, 1L, updateRequest, listOwner));
    }

    @Test
    void updateItem_shouldThrowForbiddenException_whenUserIsNotOwner() {
        User anotherUser = new User();
        anotherUser.setId(2L);
        ItemDto.UpdateItemRequest updateRequest = new ItemDto.UpdateItemRequest("New Name", null, null);
        when(shoppingListRepository.findById(1L)).thenReturn(Optional.of(shoppingList));

        assertThrows(ForbiddenException.class, () -> itemService.updateItem(1L, 1L, updateRequest, anotherUser));
    }

    @Test
    void deleteItem_shouldDeleteItem_whenUserIsOwner() {
        when(shoppingListRepository.findById(1L)).thenReturn(Optional.of(shoppingList));
        when(itemRepository.findByIdAndShoppingListId(1L, 1L)).thenReturn(Optional.of(item));
        doNothing().when(itemRepository).delete(item);

        assertDoesNotThrow(() -> itemService.deleteItem(1L, 1L, listOwner));

        verify(itemRepository, times(1)).delete(item);
    }

    @Test
    void deleteItem_shouldThrowForbiddenException_whenUserIsNotOwnerOrCollaborator() {
        User anotherUser = new User();
        anotherUser.setId(2L);
        when(shoppingListRepository.findById(1L)).thenReturn(Optional.of(shoppingList));

        assertThrows(ForbiddenException.class, () -> itemService.deleteItem(1L, 1L, anotherUser));

        verify(itemRepository, never()).delete(any(Item.class));
    }

    @Test
    void deleteItem_shouldThrowResourceNotFoundException_whenItemNotFound() {
        when(shoppingListRepository.findById(1L)).thenReturn(Optional.of(shoppingList));
        when(itemRepository.findByIdAndShoppingListId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> itemService.deleteItem(1L, 1L, listOwner));

        verify(itemRepository, never()).delete(any(Item.class));
    }

    @Test
    void deleteItem_shouldThrowResourceNotFoundException_whenListNotFound() {
        when(shoppingListRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> itemService.deleteItem(1L, 1L, listOwner));

        verify(itemRepository, never()).delete(any(Item.class));
    }
}
