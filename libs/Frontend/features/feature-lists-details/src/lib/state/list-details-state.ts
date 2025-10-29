import { computed, inject, Injectable, signal } from '@angular/core';
import {
  CreateItemRequest,
  ItemControllerRestService,
  ItemResponse,
  ShoppingListControllerRestService,
  ShoppingListResponse,
  UpdateItemRequest,
} from '@your-list/shared/data-access/data-access-api';
import { forkJoin } from 'rxjs';

interface ListItem extends ItemResponse {
  isOptimistic?: boolean;
}

export interface ProductItemViewModel {
  id?: number;
  name?: string;
  description?: string;
  isBought?: boolean;
  isEditingName?: boolean;
  isEditingDescription?: boolean;
  isOptimistic?: boolean;
}

export interface ListDetailsViewModel {
  listInfo: {
    id: number;
    name: string;
    isOwner: boolean;
    shareToken: string;
  } | null;
  itemsToBuy: ProductItemViewModel[];
  boughtItems: ProductItemViewModel[];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ListDetailsState {
  private itemControllerRestService = inject(ItemControllerRestService);
  private shoppingListControllerRestService = inject(
    ShoppingListControllerRestService
  );

  // State Signals
  private list = signal<ShoppingListResponse | null>(null);
  private items = signal<ListItem[]>([]);
  private listId = signal<number | null>(null);
  public isLoading = signal<boolean>(true);
  public error = signal<string | null>(null);

  // Computed Signals
  public itemsToBuy = computed(() =>
    this.items()
      .filter((item) => !item.isBought)
      .map(this.toProductItemViewModel)
  );
  public boughtItems = computed(() =>
    this.items()
      .filter((item) => item.isBought)
      .map(this.toProductItemViewModel)
  );

  public viewModel = computed<ListDetailsViewModel>(() => {
    const list = this.list();
    const itemsToBuy = this.itemsToBuy();
    const boughtItems = this.boughtItems();
    const isLoading = this.isLoading();
    const error = this.error();

    const listInfo =
      list &&
      list.id != null &&
      list.name != null &&
      list.isOwner != null &&
      list.shareToken != null
        ? {
            id: list.id,
            name: list.name,
            isOwner: list.isOwner,
            shareToken: list.shareToken,
          }
        : null;

    return {
      listInfo,
      itemsToBuy,
      boughtItems,
      isLoading,
      error,
      isEmpty: itemsToBuy.length === 0 && boughtItems.length === 0,
    };
  });

  public fetchData(listId: number): void {
    this.listId.set(listId);
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      list: this.shoppingListControllerRestService.getList( listId ),
      items: this.itemControllerRestService.getAllItemsForList( listId ),
    }).subscribe({
      next: ({ list, items }) => {
        this.list.set(list);
        this.items.set(items);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load list details.');
        this.isLoading.set(false);
      },
    });
  }

  public addItem(item: CreateItemRequest): void {
    const listId = this.listId();
    if (!listId) return;

    // Optimistic update
    const tempId = Date.now();
    const optimisticItem: ListItem = {
      id: tempId,
      name: item.name,
      description: item.description,
      isBought: false,
      listId: listId,
      isOptimistic: true,
    };
    this.items.update((currentItems) => [...currentItems, optimisticItem]);

    this.itemControllerRestService.createItem(listId, item).subscribe({
      next: (newItem) => {
        // Replace optimistic item with real one from backend
        this.items.update((currentItems) =>
          currentItems.map((i) => (i.id === tempId ? newItem : i))
        );
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to add item.');
        // Rollback optimistic update
        this.items.update((currentItems) =>
          currentItems.filter((i) => i.id !== tempId)
        );
      },
    });
  }

  public updateItem(itemId: number, data: UpdateItemRequest): void {
    const listId = this.listId();
    if (!listId) return;

    const originalItems = this.items();
    const updatedItems = originalItems.map((item) =>
      item.id === itemId ? { ...item, ...data, isOptimistic: true } : item
    );

    // Optimistic update
    this.items.set(updatedItems);

    this.itemControllerRestService.updateItem(listId, itemId, data).subscribe({
      next: (updatedItem) => {
        this.items.update((currentItems) =>
          currentItems.map((i) => (i.id === itemId ? updatedItem : i))
        );
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to update item.');
        // Rollback
        this.items.set(originalItems);
      },
    });
  }

  public deleteItem(itemId: number): void {
    const listId = this.listId();
    if (!listId) return;

    const originalItems = this.items();
    const updatedItems = originalItems.filter((item) => item.id !== itemId);

    // Optimistic update
    this.items.set(updatedItems);

    this.itemControllerRestService.deleteItem(listId, itemId ).subscribe({
      error: (err) => {
        console.error(err);
        this.error.set('Failed to delete item.');
        // Rollback
        this.items.set(originalItems);
      },
    });
  }

  private toProductItemViewModel(item: ListItem): ProductItemViewModel {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      isBought: item.isBought,
      isEditingName: false,
      isEditingDescription: false,
      isOptimistic: !!item.isOptimistic,
    };
  }
}
