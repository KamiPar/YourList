import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'your-list-list-header',
  standalone: true,
  imports: [],
  templateUrl: './list-header.html',
  styleUrl: './list-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListHeader {
  @Input({ required: true }) public listName!: string;
  @Input({ required: true }) public isOwner!: boolean;

  @Output() public backClicked = new EventEmitter<void>();
  @Output() public shareClicked = new EventEmitter<void>();
  @Output() public listNameUpdated = new EventEmitter<string>();

  // TODO: Implement inline editing logic
}
