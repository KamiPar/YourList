import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ShareBottomSheet } from '../share-bottom-sheet/share-bottom-sheet';


import { toSignal } from '@angular/core/rxjs-interop';
import { EmptyStateComponent } from '@your-list/shared/ui';
import { map } from 'rxjs';
import { ListDetailsState } from '../../state/list-details-state';
import { ListHeader } from '../list-header/list-header';
import { AddItemForm } from '../add-item-form/add-item-form';
import { ProductList } from '../product-list/product-list';

@Component({
  selector: 'your-list-list-details-view',
  standalone: true,
  imports: [ListHeader, AddItemForm, ProductList, EmptyStateComponent],
  templateUrl: './list-details-view.html',
  styleUrl: './list-details-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ListDetailsState],
})
export class ListDetailsView {
  private activatedRoute = inject(ActivatedRoute);
  public state = inject(ListDetailsState);

  private listId = toSignal(
    this.activatedRoute.params.pipe(map((params) => params['id']))
  );
  private bottomSheet = inject(MatBottomSheet);

  constructor() {
    effect(() => {
      const id = this.listId();
      if (id) {
        this.state.fetchData(Number(id));
      }
    });
  }

  public onShareClicked(): void {
    const viewModel = this.state.viewModel();
    if (viewModel?.listInfo?.shareToken) {
      const shareToken = viewModel.listInfo.shareToken
      this.bottomSheet.open(ShareBottomSheet, {
        data: { shareToken },
      });
    }
  }
}
