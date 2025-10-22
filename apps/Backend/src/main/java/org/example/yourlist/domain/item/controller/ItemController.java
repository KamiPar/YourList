package org.example.yourlist.domain.item.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.yourlist.domain.item.dto.ItemDto;
import org.example.yourlist.domain.item.service.ItemService;
import org.example.yourlist.domain.user.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lists/{listId}/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ItemDto.ItemResponse createItem(
            @PathVariable Long listId,
            @Valid @RequestBody ItemDto.CreateItemRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
      return itemService.createItem(listId, request, currentUser);
    }
}
