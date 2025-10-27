package org.example.yourlist.domain.list.mapper;

import org.example.yourlist.domain.list.dto.ShoppingListDto;
import org.example.yourlist.domain.list.entity.ShoppingList;
import org.example.yourlist.domain.user.entity.User;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public abstract class ShoppingListMapper {

    @Mapping(target = "ownerId", source = "entity.owner.id")
    @Mapping(target = "isOwner", source = "entity", qualifiedByName = "isOwnerMapping")
    public abstract ShoppingListDto.ShoppingListResponse toDto(ShoppingList entity, @Context User currentUser);

    @Named("isOwnerMapping")
    boolean isOwnerMapping(ShoppingList entity, @Context User currentUser) {
        if (entity == null || entity.getOwner() == null || currentUser == null) {
            return false;
        }
        return entity.getOwner().getId().equals(currentUser.getId());
    }
}
