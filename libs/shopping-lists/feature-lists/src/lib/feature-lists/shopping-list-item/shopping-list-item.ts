import { ChangeDetectionStrategy, Component, EventEmitter, InputSignal, input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShoppingListSummaryVm } from '../list-view/list-view.component';

@Component({
  selector: 'your-list-shopping-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shopping-list-item.html',
  styleUrl: './shopping-list-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingListItem {
  public list: InputSignal<ShoppingListSummaryVm> = input.required<ShoppingListSummaryVm>();

  @Output()
  public navigate: EventEmitter<number> = new EventEmitter<number>();

  @Output()
  public delete: EventEmitter<number> = new EventEmitter<number>();

  public onNavigate(): void {
    this.navigate.emit(this.list().id);
  }

  public onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.list().id);
  }
}
