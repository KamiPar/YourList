package org.example.yourlist.domain.list.mapper;

import org.example.yourlist.domain.list.dto.ShoppingListDto;
import org.example.yourlist.domain.list.entity.ShoppingList;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ShoppingListMapper {
    @Mapping(source = "owner.id", target = "ownerId")
    @Mapping(target = "isOwner", expression = "java(true)")
    ShoppingListDto.ShoppingListResponse toShoppingListResponse(ShoppingList shoppingList);
}
