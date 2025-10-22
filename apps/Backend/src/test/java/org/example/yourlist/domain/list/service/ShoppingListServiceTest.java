package org.example.yourlist.domain.list.service;

import org.example.yourlist.domain.list.dto.ShoppingListDto;
import org.example.yourlist.domain.list.entity.ShoppingList;
import org.example.yourlist.domain.list.mapper.ShoppingListMapper;
import org.example.yourlist.domain.list.repository.ShoppingListRepository;
import org.example.yourlist.domain.user.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShoppingListServiceTest {

    @Mock
    private ShoppingListRepository shoppingListRepository;

    @Mock
    private ShoppingListMapper shoppingListMapper;

    @InjectMocks
    private ShoppingListService shoppingListService;

    @Test
    void shouldCreateListSuccessfully() {
        // Given
        User currentUser = new User();
        currentUser.setId(1L);

        ShoppingListDto.CreateShoppingListRequest request = new ShoppingListDto.CreateShoppingListRequest("Test List");

        ShoppingList savedShoppingList = ShoppingList.builder()
                .name("Test List")
                .owner(currentUser)
                .build();

        ShoppingListDto.ShoppingListResponse expectedResponse = new ShoppingListDto.ShoppingListResponse(
                1L, "Test List", 1L, true, UUID.randomUUID(), null, null
        );

        when(shoppingListRepository.save(any(ShoppingList.class))).thenReturn(savedShoppingList);
        when(shoppingListMapper.toShoppingListResponse(savedShoppingList)).thenReturn(expectedResponse);

        // When
        ShoppingListDto.ShoppingListResponse actualResponse = shoppingListService.createList(request, currentUser);

        // Then
        assertNotNull(actualResponse);
        assertEquals(expectedResponse.id(), actualResponse.id());
        assertEquals(expectedResponse.name(), actualResponse.name());
        assertEquals(expectedResponse.ownerId(), actualResponse.ownerId());
    }
}
