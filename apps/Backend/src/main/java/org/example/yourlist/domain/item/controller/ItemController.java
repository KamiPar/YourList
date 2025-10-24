package org.example.yourlist.domain.item.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
@SecurityRequirement(name = "bearerAuth")
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

    @PatchMapping("/{itemId}")
    @ResponseStatus(HttpStatus.OK)
    public ItemDto.ItemResponse updateItem(
            @PathVariable Long listId,
            @PathVariable Long itemId,
            @Valid @RequestBody ItemDto.UpdateItemRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return itemService.updateItem(listId, itemId, request, currentUser);
    }

    @DeleteMapping("/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(
            @PathVariable Long listId,
            @PathVariable Long itemId,
            @AuthenticationPrincipal User currentUser
    ) {
        itemService.deleteItem(listId, itemId, currentUser);
    }
}
