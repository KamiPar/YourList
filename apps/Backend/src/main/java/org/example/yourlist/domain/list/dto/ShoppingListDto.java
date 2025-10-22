package org.example.yourlist.domain.list.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.yourlist.domain.item.dto.ItemDto;
import org.example.yourlist.domain.user.dto.UserDto;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class ShoppingListDto {
    private ShoppingListDto() {}

    /**
     * DTO for creating a new list.
     * @param name The name of the list.
     */
    public record CreateShoppingListRequest(
            @NotNull(message = "Name is required")
            @Size(max = 255, message = "Name must not exceed 255 characters")
            String name
    ) {}

    /**
     * DTO for updating an existing list.
     * @param name The new name for the list.
     */
    public record UpdateShoppingListRequest(
            @NotNull(message = "Name is required")
            @Size(max = 255, message = "Name must not exceed 255 characters")
            String name
    ) {}

    /**
     * DTO representing a list in a collection response.
     * This is an extended view with aggregated data.
     * @param id The list's ID.
     * @param name The list's name.
     * @param ownerId The ID of the list's owner.
     * @param isOwner Flag indicating if the current user is the owner.
     * @param shareToken The unique token for sharing the list.
     * @param createdAt Timestamp of list creation.
     * @param updatedAt Timestamp of the last update.
     * @param itemCount Total number of items on the list.
     * @param boughtItemCount Number of items marked as bought.
     */
    public record ShoppingListSummaryResponse(
            Long id,
            String name,
            Long ownerId,
            boolean isOwner,
            UUID shareToken,
            Instant createdAt,
            Instant updatedAt,
            long itemCount,
            long boughtItemCount
    ) {}

    /**
     * DTO for a single list response.
     * This is a detailed view of a specific list.
     * @param id The list's ID.
     * @param name The list's name.
     * @param ownerId The ID of the list's owner.
     * @param isOwner Flag indicating if the current user is the owner.
     * @param shareToken The unique token for sharing the list.
     * @param createdAt Timestamp of list creation.
     * @param updatedAt Timestamp of the last update.
     */
    public record ShoppingListResponse(
            Long id,
            String name,
            Long ownerId,
            boolean isOwner,
            UUID shareToken,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}

    /**
     * DTO for migrating a guest list to a registered user account.
     * @param name The name of the guest list.
     * @param items A list of items from the guest list.
     */
    public record MigrateShoppingListRequest(
            @NotNull @Size(max = 255) String name,
            List<ItemDto.CreateItemRequest> items
    ) {}

    /**
     * DTO for the response after migrating a guest list.
     * @param id The ID of the newly created list.
     * @param name The name of the list.
     * @param ownerId The ID of the list's owner.
     * @param isOwner Always true for the user who migrated the list.
     * @param shareToken The unique token for sharing the list.
     * @param createdAt Timestamp of list creation.
     * @param updatedAt Timestamp of the last update.
     * @param itemCount The number of items migrated to the list.
     */
    public record MigrateShoppingListResponse(
            Long id,
            String name,
            Long ownerId,
            boolean isOwner,
            UUID shareToken,
            Instant createdAt,
            Instant updatedAt,
            int itemCount
    ) {}

    /**
     * DTO for the response when requesting a list's share token.
     * @param shareToken The unique token for sharing the list.
     * @param shareUrl The full URL to join the list.
     */
    public record ShareTokenResponse(
            UUID shareToken,
            String shareUrl
    ) {}

    /**
     * DTO for the request to join a shared list.
     * @param shareToken The share token of the list to join.
     */
    public record JoinShoppingListRequest(
            @NotNull UUID shareToken
    ) {}

    /**
     * DTO for the response containing the list's owner and collaborators.
     * @param owner The user DTO of the list's owner.
     * @param collaborators A list of user DTOs for the collaborators.
     */
    public record CollaboratorsResponse(
            UserDto.CollaboratorDto owner,
            List<UserDto.CollaboratorDto> collaborators
    ) {}

    /**
     * DTO for WebSocket message when a list's details are updated.
     * @param id The ID of the updated list.
     * @param name The new name of the list.
     * @param updatedAt The timestamp of the update.
     */
    public record ShoppingListUpdatedWs(
            Long id,
            String name,
            Instant updatedAt
    ) {}
}
