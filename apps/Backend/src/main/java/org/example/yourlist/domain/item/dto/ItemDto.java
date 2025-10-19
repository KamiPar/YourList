package org.example.yourlist.domain.item.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class ItemDto {
    private ItemDto() {}

    /**
     * DTO for creating a new item on a list.
     * @param name The name of the item.
     * @param description An optional description or quantity.
     */
    public record CreateItemRequest(
            @NotNull(message = "Name is required")
            @Size(max = 255, message = "Name must not exceed 255 characters")
            String name,

            @Size(max = 255, message = "Description must not exceed 255 characters")
            String description
    ) {}

    /**
     * DTO for updating an existing item. All fields are optional.
     * @param name The new name of the item.
     * @param description The new description for the item.
     * @param isBought The new bought status.
     */
    public record UpdateItemRequest(
            @Size(max = 255) String name,
            @Size(max = 255) String description,
            Boolean isBought
    ) {}

    /**
     * DTO representing a single item in a response.
     * @param id The item's ID.
     * @param listId The ID of the list it belongs to.
     * @param name The item's name.
     * @param description The item's description.
     * @param isBought The item's bought status.
     * @param createdAt Timestamp of item creation.
     */
    public record ItemResponse(
            Long id,
            Long listId,
            String name,
            String description,
            boolean isBought,
            Instant createdAt
    ) {}

    /**
     * DTO for WebSocket message when an item is deleted.
     * @param id The ID of the deleted item.
     * @param listId The ID of the list it belonged to.
     */
    public record ItemDeletedWs(
            Long id,
            Long listId
    ) {}
}
