package org.example.yourlist.domain.list.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ShoppingListSummaryResponse(
        Long id,
        String name,
        Long ownerId,
        boolean isOwner,
        UUID shareToken,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        long itemCount,
        long boughtItemCount
) {}
