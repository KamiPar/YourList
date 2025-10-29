import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ProductItemViewModel } from '../../state/list-details-state';
import { UpdateItemRequest } from '@your-list/shared/data-access/data-access-api';

@Component({
  selector: 'your-list-product-item',
  standalone: true,
  imports: [],
  templateUrl: './product-item.html',
  styleUrl: './product-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductItem {
  @Input({ required: true }) public item!: ProductItemViewModel;

  @Output() public itemUpdated = new EventEmitter<{
    itemId: number;
    data: UpdateItemRequest;
  }>();
  @Output() public itemDeleted = new EventEmitter<number>();

  public onStatusChange(isBought: boolean): void {
    this.itemUpdated.emit({
      itemId: this.item.id!,
      data: { isBought },
    });
  }

  public onDelete(): void {
    this.itemDeleted.emit(this.item.id);
  }
}
