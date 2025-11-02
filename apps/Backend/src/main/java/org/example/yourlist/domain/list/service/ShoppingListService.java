package org.example.yourlist.domain.list.service;

import lombok.RequiredArgsConstructor;
import org.example.yourlist.domain.list.dto.ShoppingListDto;
import org.example.yourlist.domain.list.dto.ShoppingListSummaryResponse;
import org.example.yourlist.domain.list.entity.ShoppingList;
import org.example.yourlist.domain.list.mapper.ShoppingListMapper;
import org.example.yourlist.domain.list.repository.ShoppingListRepository;
import org.example.yourlist.domain.listshare.entity.ShoppingListShare;
import org.example.yourlist.domain.listshare.repository.ShoppingListShareRepository;
import org.example.yourlist.domain.user.entity.User;
import org.example.yourlist.exception.ForbiddenException;
import org.example.yourlist.exception.UserAlreadyHasAccessException;
import org.example.yourlist.exception.ResourceNotFoundException;
import org.example.yourlist.websocket.WebSocketUpdateService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShoppingListService {
    private final ShoppingListRepository shoppingListRepository;
    private final ShoppingListShareRepository shoppingListShareRepository;
    private final ShoppingListMapper shoppingListMapper;
    private final WebSocketUpdateService webSocketUpdateService;

    @Value("${app.base-url}")
    private String appBaseUrl;

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

    @Transactional
    public ShoppingListDto.ShoppingListResponse updateList(Long listId, ShoppingListDto.UpdateShoppingListRequest request, User currentUser) {
        ShoppingList shoppingList = shoppingListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Shopping list not found with id: " + listId));

        if (!shoppingList.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You do not have permission to update this list.");
        }

        shoppingList.setName(request.name());
        shoppingList.setUpdatedAt(LocalDateTime.now());
        ShoppingList updatedList = shoppingListRepository.save(shoppingList);

        ShoppingListDto.ShoppingListResponse listResponse = shoppingListMapper.toDto(updatedList, currentUser);

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                var event = new ShoppingListDto.ShoppingListUpdatedWs(
                        listResponse.id(),
                        listResponse.name(),
                        Instant.now()
                );
                webSocketUpdateService.broadcast(listId, "LIST_UPDATED", event);
            }
        });

        return listResponse;
    }

    @Transactional(readOnly = true)
    public Page<ShoppingListSummaryResponse> findAllListsForUser(User currentUser, Pageable pageable) {
        return shoppingListRepository.findAllForUser(currentUser.getId(), pageable);
    }

    @Transactional(readOnly = true)
    public ShoppingListDto.ShoppingListResponse getShoppingListDetails(Long listId, User currentUser) {
        ShoppingList shoppingList = shoppingListRepository.findByIdWithOwnerAndShares(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Shopping list not found with id: " + listId));

       checkAccess(listId, currentUser);

        return shoppingListMapper.toDto(shoppingList, currentUser);
    }

    @Transactional(readOnly = true)
    public void checkAccess(Long listId, User currentUser) {
        ShoppingList shoppingList = shoppingListRepository.findByIdWithOwnerAndShares(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Shopping list not found with id: " + listId));

        boolean isOwner = shoppingList.getOwner().getId().equals(currentUser.getId());
        boolean isCollaborator = shoppingList.getShares().stream()
                .anyMatch(share -> share.getUser().getId().equals(currentUser.getId()));

        if (!isOwner && !isCollaborator) {
            throw new ForbiddenException("You do not have permission to access this list.");
        }
    }

    @Transactional(readOnly = true)
    public ShoppingListDto.ShareTokenResponse getShareTokenForOwner(Long listId, User currentUser) {
        ShoppingList shoppingList = shoppingListRepository.findById(listId)
                .orElseThrow(() -> new ResourceNotFoundException("Shopping list not found with id: " + listId));

        if (!shoppingList.getOwner().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You do not have permission to get the share token for this list.");
        }

        String shareUrl = appBaseUrl + "/join/" + shoppingList.getShareToken();

        return new ShoppingListDto.ShareTokenResponse(shoppingList.getShareToken(), shareUrl);
    }

    @Transactional
    public ShoppingListDto.ShoppingListResponse joinSharedList(ShoppingListDto.JoinShoppingListRequest request, User currentUser) {
        ShoppingList shoppingList = shoppingListRepository.findByShareToken(request.shareToken())
                .orElseThrow(() -> new ResourceNotFoundException("Shopping list not found with the provided share token."));

        if (shoppingList.getOwner().getId().equals(currentUser.getId())) {
            throw new UserAlreadyHasAccessException("You are the owner of this list.");
        }

        boolean alreadyMember = shoppingListShareRepository.existsByShoppingListIdAndUserId(shoppingList.getId(), currentUser.getId());
        if (alreadyMember) {
            throw new UserAlreadyHasAccessException("You are already a member of this list.");
        }

        ShoppingListShare share = ShoppingListShare.builder()
                .id(new ShoppingListShare.ShoppingListShareId(shoppingList.getId(), currentUser.getId()))
                .shoppingList(shoppingList)
                .user(currentUser)
                .build();

        shoppingListShareRepository.save(share);

        return shoppingListMapper.toDto(shoppingList, currentUser);
    }
}
