package org.example.yourlist.domain.item.mapper;

import org.example.yourlist.domain.item.dto.ItemDto;
import org.example.yourlist.domain.item.entity.Item;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ItemMapper {
  @Mapping(target = "isBought", constant = "false")
    Item toEntity(ItemDto.CreateItemRequest request);

    @Mapping(source = "shoppingList.id", target = "listId")
    ItemDto.ItemResponse toResponse(Item item);
}
