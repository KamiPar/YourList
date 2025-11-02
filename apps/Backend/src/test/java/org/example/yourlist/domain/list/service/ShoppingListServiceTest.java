package org.example.yourlist.domain.list.service;

import org.example.yourlist.domain.list.dto.ShoppingListDto;
import org.example.yourlist.domain.list.dto.ShoppingListSummaryResponse;
import org.example.yourlist.domain.list.entity.ShoppingList;
import org.example.yourlist.domain.list.mapper.ShoppingListMapper;
import org.example.yourlist.domain.list.repository.ShoppingListRepository;
import org.example.yourlist.domain.listshare.repository.ShoppingListShareRepository;
import org.example.yourlist.domain.user.entity.User;
import org.example.yourlist.exception.UserAlreadyHasAccessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.example.yourlist.exception.ForbiddenException;
import org.example.yourlist.exception.ResourceNotFoundException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShoppingListServiceTest {

    @Mock
    private ShoppingListRepository shoppingListRepository;

    @Mock
    private ShoppingListShareRepository shoppingListShareRepository;

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
        when(shoppingListMapper.toDto(any(ShoppingList.class), any(User.class))).thenReturn(expectedResponse);

        // When
        ShoppingListDto.ShoppingListResponse actualResponse = shoppingListService.createList(request, currentUser);

        // Then
        assertNotNull(actualResponse);
        assertEquals(expectedResponse.id(), actualResponse.id());
        assertEquals(expectedResponse.name(), actualResponse.name());
        assertEquals(expectedResponse.ownerId(), actualResponse.ownerId());
    }

    @Test
    void shouldFindAllListsForUser() {
        // Given
        User currentUser = new User();
        currentUser.setId(1L);
        Pageable pageable = PageRequest.of(0, 10);

        ShoppingListSummaryResponse summaryResponse = new ShoppingListSummaryResponse(
                1L, "Test List", 1L, true, UUID.randomUUID(), LocalDateTime.now(), LocalDateTime.now(), 5, 2
        );
        List<ShoppingListSummaryResponse> responses = Collections.singletonList(summaryResponse);
        Page<ShoppingListSummaryResponse> expectedPage = new PageImpl<>(responses, pageable, 1);

        when(shoppingListRepository.findAllForUser(currentUser.getId(), pageable)).thenReturn(expectedPage);

        // When
        Page<ShoppingListSummaryResponse> actualPage = shoppingListService.findAllListsForUser(currentUser, pageable);

        // Then
        assertNotNull(actualPage);
        assertEquals(1, actualPage.getTotalElements());
        assertEquals("Test List", actualPage.getContent().get(0).name());
    }

    @Test
    void shouldGetShoppingListDetailsSuccessfullyForOwner() {
        // Given
        Long listId = 1L;
        User owner = new User();
        owner.setId(1L);

        ShoppingList shoppingList = ShoppingList.builder()
                .id(listId)
                .name("My List")
                .owner(owner)
                .build();

        ShoppingListDto.ShoppingListResponse expectedResponse = new ShoppingListDto.ShoppingListResponse(
                listId, "My List", owner.getId(), true, UUID.randomUUID(), null, null
        );

        when(shoppingListRepository.findByIdWithOwner(listId)).thenReturn(Optional.of(shoppingList));
        when(shoppingListMapper.toDto(shoppingList, owner)).thenReturn(expectedResponse);

        // When
        ShoppingListDto.ShoppingListResponse actualResponse = shoppingListService.getShoppingListDetails(listId, owner);

        // Then
        assertNotNull(actualResponse);
        assertEquals(expectedResponse.id(), actualResponse.id());
        assertEquals(expectedResponse.name(), actualResponse.name());
        assertTrue(actualResponse.isOwner());
    }

    @Test
    void shouldThrowResourceNotFoundExceptionWhenListDoesNotExist() {
        // Given
        Long listId = 99L;
        User currentUser = new User();
        currentUser.setId(1L);

        when(shoppingListRepository.findByIdWithOwner(listId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> shoppingListService.getShoppingListDetails(listId, currentUser));
    }

    @Test
    void shouldThrowForbiddenExceptionWhenUserIsNotOwner() {
        // Given
        Long listId = 1L;
        User owner = new User();
        owner.setId(1L);

        User anotherUser = new User();
        anotherUser.setId(2L);

        ShoppingList shoppingList = ShoppingList.builder()
                .id(listId)
                .name("Owner's List")
                .owner(owner)
                .build();

        when(shoppingListRepository.findByIdWithOwner(listId)).thenReturn(Optional.of(shoppingList));

        // When & Then
        assertThrows(ForbiddenException.class, () -> shoppingListService.getShoppingListDetails(listId, anotherUser));
    }

    @Test
    void shouldGetShareTokenSuccessfullyForOwner() {
        // Given
        Long listId = 1L;
        User owner = new User();
        owner.setId(1L);
        UUID shareToken = UUID.randomUUID();
        String baseUrl = "https://yourlist.app";

        ShoppingList shoppingList = ShoppingList.builder()
                .id(listId)
                .name("My List")
                .owner(owner)
                .shareToken(shareToken)
                .build();

        ReflectionTestUtils.setField(shoppingListService, "appBaseUrl", baseUrl);
        when(shoppingListRepository.findById(listId)).thenReturn(Optional.of(shoppingList));

        // When
        ShoppingListDto.ShareTokenResponse response = shoppingListService.getShareTokenForOwner(listId, owner);

        // Then
        assertNotNull(response);
        assertEquals(shareToken, response.shareToken());
        assertEquals(baseUrl + "/join/" + shareToken, response.shareUrl());
    }

    @Test
    void shouldThrowResourceNotFoundExceptionWhenGettingShareTokenForNonExistentList() {
        // Given
        Long listId = 99L;
        User currentUser = new User();
        currentUser.setId(1L);

        when(shoppingListRepository.findById(listId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> shoppingListService.getShareTokenForOwner(listId, currentUser));
    }

    @Test
    void shouldThrowForbiddenExceptionWhenGettingShareTokenForNotOwnedList() {
        // Given
        Long listId = 1L;
        User owner = new User();
        owner.setId(1L);

        User anotherUser = new User();
        anotherUser.setId(2L);

        ShoppingList shoppingList = ShoppingList.builder()
                .id(listId)
                .name("Owner's List")
                .owner(owner)
                .build();

        when(shoppingListRepository.findById(listId)).thenReturn(Optional.of(shoppingList));

        // When & Then
        assertThrows(ForbiddenException.class, () -> shoppingListService.getShareTokenForOwner(listId, anotherUser));
    }

    @Test
    void shouldJoinSharedListSuccessfully() {
        // Given
        UUID shareToken = UUID.randomUUID();
        User owner = User.builder().id(1L).build();
        User joiner = User.builder().id(2L).build();
        ShoppingList list = ShoppingList.builder().id(10L).owner(owner).shareToken(shareToken).name("Shared List").build();
        ShoppingListDto.JoinShoppingListRequest request = new ShoppingListDto.JoinShoppingListRequest(shareToken);
        ShoppingListDto.ShoppingListResponse expectedResponse = new ShoppingListDto.ShoppingListResponse(10L, "Shared List", 1L, false, shareToken, null, null);

        when(shoppingListRepository.findByShareToken(shareToken)).thenReturn(Optional.of(list));
        when(shoppingListShareRepository.existsByShoppingListIdAndUserId(10L, 2L)).thenReturn(false);
        when(shoppingListMapper.toDto(list, joiner)).thenReturn(expectedResponse);

        // When
        ShoppingListDto.ShoppingListResponse response = shoppingListService.joinSharedList(request, joiner);

        // Then
        assertNotNull(response);
        assertEquals(expectedResponse, response);
    }

    @Test
    void shouldThrowResourceNotFoundExceptionWhenJoiningWithInvalidToken() {
        // Given
        UUID invalidToken = UUID.randomUUID();
        User joiner = User.builder().id(2L).build();
        ShoppingListDto.JoinShoppingListRequest request = new ShoppingListDto.JoinShoppingListRequest(invalidToken);

        when(shoppingListRepository.findByShareToken(invalidToken)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> shoppingListService.joinSharedList(request, joiner));
    }

    @Test
    void shouldThrowUserAlreadyHasAccessExceptionWhenJoiningOwnList() {
        // Given
        UUID shareToken = UUID.randomUUID();
        User owner = User.builder().id(1L).build();
        ShoppingList list = ShoppingList.builder().id(10L).owner(owner).shareToken(shareToken).build();
        ShoppingListDto.JoinShoppingListRequest request = new ShoppingListDto.JoinShoppingListRequest(shareToken);

        when(shoppingListRepository.findByShareToken(shareToken)).thenReturn(Optional.of(list));

        // When & Then
        assertThrows(UserAlreadyHasAccessException.class, () -> shoppingListService.joinSharedList(request, owner));
    }

    @Test
    void shouldThrowUserAlreadyHasAccessExceptionWhenJoiningListAsExistingMember() {
        // Given
        UUID shareToken = UUID.randomUUID();
        User owner = User.builder().id(1L).build();
        User joiner = User.builder().id(2L).build();
        ShoppingList list = ShoppingList.builder().id(10L).owner(owner).shareToken(shareToken).build();
        ShoppingListDto.JoinShoppingListRequest request = new ShoppingListDto.JoinShoppingListRequest(shareToken);

        when(shoppingListRepository.findByShareToken(shareToken)).thenReturn(Optional.of(list));
        when(shoppingListShareRepository.existsByShoppingListIdAndUserId(10L, 2L)).thenReturn(true);

        // When & Then
        assertThrows(UserAlreadyHasAccessException.class, () -> shoppingListService.joinSharedList(request, joiner));
    }
}
