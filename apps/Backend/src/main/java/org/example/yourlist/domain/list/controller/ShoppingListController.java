package org.example.yourlist.domain.list.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.yourlist.domain.list.dto.ShoppingListDto;
import org.example.yourlist.domain.list.dto.ShoppingListSummaryResponse;
import org.example.yourlist.domain.list.service.ShoppingListService;
import org.example.yourlist.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor
public class ShoppingListController {
    private final ShoppingListService shoppingListService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShoppingListDto.ShoppingListResponse createList(
            @Valid @RequestBody ShoppingListDto.CreateShoppingListRequest createShoppingListRequest,
            @AuthenticationPrincipal User currentUser
    ) {
        return shoppingListService.createList(createShoppingListRequest, currentUser);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public Page<ShoppingListSummaryResponse> getAllListsForUser(
            @AuthenticationPrincipal User currentUser,
            Pageable pageable
    ) {
        return shoppingListService.findAllListsForUser(currentUser, pageable);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ShoppingListDto.ShoppingListResponse getList(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return shoppingListService.getShoppingListDetails(id, currentUser);
    }
}
