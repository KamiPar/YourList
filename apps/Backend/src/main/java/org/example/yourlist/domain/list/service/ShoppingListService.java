package org.example.yourlist.domain.list.service;

import lombok.RequiredArgsConstructor;
import org.example.yourlist.domain.list.dto.ShoppingListDto;
import org.example.yourlist.domain.list.dto.ShoppingListSummaryResponse;
import org.example.yourlist.domain.list.entity.ShoppingList;
import org.example.yourlist.domain.list.mapper.ShoppingListMapper;
import org.example.yourlist.domain.list.repository.ShoppingListRepository;
import org.example.yourlist.domain.user.entity.User;
import org.example.yourlist.exception.ForbiddenException;
import org.example.yourlist.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
        return shoppingListMapper.toDto(savedShoppingList, currentUser);
    }

    @Transactional(readOnly = true)
    public Page<ShoppingListSummaryResponse> findAllListsForUser(User currentUser, Pageable pageable) {
        return shoppingListRepository.findAllForUser(currentUser.getId(), pageable);
    }

    @Transactional(readOnly = true)
    public ShoppingListDto.ShoppingListResponse getShoppingListDetails(Long listId, User currentUser) {
        ShoppingList shoppingList = shoppingListRepository.findByIdWithOwner(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Shopping list not found with id: " + listId));

        boolean isOwner = shoppingList.getOwner().getId().equals(currentUser.getId());
        // TODO: Add logic for shared lists access check
        if (!isOwner) {
            throw new ForbiddenException("You do not have permission to access this list.");
        }

        return shoppingListMapper.toDto(shoppingList, currentUser);
    }

    public void checkAccess(Long listId, User currentUser) {
        ShoppingList shoppingList = shoppingListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Shopping list not found with id: " + listId));

        boolean isOwner = shoppingList.getOwner().getId().equals(currentUser.getId());
        boolean isCollaborator = shoppingList.getShares().stream()
                .anyMatch(share -> share.getUser().getId().equals(currentUser.getId()));

        if (!isOwner && !isCollaborator) {
            throw new ForbiddenException("You do not have permission to access this list.");
        }
    }
}
