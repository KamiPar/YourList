package org.example.yourlist.domain.list.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.yourlist.domain.list.dto.ShoppingListDto;
import org.example.yourlist.domain.list.service.ShoppingListService;
import org.example.yourlist.domain.user.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public ShoppingListDto.ShoppingListResponse createList(
            @Valid @RequestBody ShoppingListDto.CreateShoppingListRequest createShoppingListRequest,
            @AuthenticationPrincipal User currentUser
    ) {
        return shoppingListService.createList(createShoppingListRequest, currentUser);
    }
}
