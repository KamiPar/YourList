import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CreateListModal } from '../create-list/create-list-modal';
import { ShoppingListItem } from '../shopping-list-item/shopping-list-item';
import { SkeletonLoaderComponent } from '@your-list/shared/ui/ui/empty-state';

import { EmptyStateComponent } from '@your-list/shared/ui/ui/empty-state';
import {
  PageShoppingListSummaryResponse, ShoppingListControllerRestService,
  ShoppingListSummaryResponse
} from '@your-list/shared/data-access/data-access-api';


export interface ShoppingListSummaryVm {
  id?: number;
  name?: string;
  isOwner?: boolean;
  lastModified?: string; // TODO: Implement date formatting pipe/logic
  itemCountLabel?: string;
  showDeleteButton?: boolean;
  isShared?: boolean;
}

@Component({
  selector: 'your-list-lists-view',
  standalone: true,
  imports: [CommonModule, RouterModule, ShoppingListItem,EmptyStateComponent, SkeletonLoaderComponent],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListViewComponent implements OnInit {
  private shoppingListControllerRestService = inject(ShoppingListControllerRestService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  private state = signal<{
    lists: ShoppingListSummaryResponse[];
    status: 'loading' | 'loaded' | 'error';
    error: string | null;
  }>({
    lists: [],
    status: 'loading',
    error: null,
  });

  public isLoading = computed(() => this.state().status === 'loading');
  public isLoaded = computed(() => this.state().status === 'loaded');
  public isEmpty = computed(() => this.isLoaded() && this.state().lists.length === 0);
  public listsVm = computed(() => this.state().lists.map((list) => this.mapToVm(list)));

  public ngOnInit(): void {
    this.shoppingListControllerRestService
      .getAllListsForUser({ page: 0, size: 20 })
      .subscribe({
        next: (response: PageShoppingListSummaryResponse) => {
          this.state.update((s) => ({
            ...s,
            lists: response.content || [],
            status: 'loaded',
          }));
        },
        error: (err: Error) => {
          this.state.update((s) => ({ ...s, status: 'error', error: err.message }));
        },
      });
  }

  public openCreateListModal(): void {
    const dialogRef = this.dialog.open(CreateListModal);

    dialogRef.afterClosed().subscribe((result: ShoppingListSummaryResponse) => {
      if (result) {
        this.state.update((s) => ({
          ...s,
          lists: [result, ...s.lists],
        }));
      }
    });
  }

  public onNavigate(listId: number): void {
    this.router.navigate(['/lists', listId]);
  }

  public onDelete(listId: number): void {
    // if (confirm('Czy na pewno chcesz usunąć tę listę?')) {
    //   this.shoppingListControllerRestService.deleteList(listId).subscribe({
    //     next: () => {
    //       this.state.update((s) => ({
    //         ...s,
    //         lists: s.lists.filter((list) => list.id !== listId),
    //       }));
    //     },
    //     error: (err) => {
    //       // TODO: Handle error (e.g., show a toast message)
    //       console.error('Error deleting list:', err);
    //     },
    //   });
    // }
  }

  private mapToVm(list: ShoppingListSummaryResponse): ShoppingListSummaryVm {
    return {
      id: list.id,
      name: list.name,
      isOwner: list.isOwner,
      lastModified: new Date(list.updatedAt).toLocaleDateString(),
      itemCountLabel: `${list.itemCount} produktów (${list.boughtItemCount} kupione)`,
      showDeleteButton: list.isOwner,
      isShared: !list.isOwner,
    };
  }
}
