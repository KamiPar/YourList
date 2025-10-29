import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ProductItemViewModel } from '../../state/list-details-state';
import { UpdateItemRequest } from '@your-list/shared/data-access/data-access-api';
import { ProductItem } from '../product-item/product-item';

@Component({
  selector:'your-list-product-list',
  standalone: true,
  imports: [ProductItem],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductList {
  @Input() public itemsToBuy: ProductItemViewModel[] = [];
  @Input() public boughtItems: ProductItemViewModel[] = [];

  @Output() public itemUpdated = new EventEmitter<{
    itemId: number;
    data: UpdateItemRequest;
  }>();
  @Output() public itemDeleted = new EventEmitter<number>();

  public onUpdate(event: { itemId: number; data: UpdateItemRequest }): void {
    this.itemUpdated.emit(event);
  }

  public onDelete(itemId: number): void {
    this.itemDeleted.emit(itemId);
  }
}
