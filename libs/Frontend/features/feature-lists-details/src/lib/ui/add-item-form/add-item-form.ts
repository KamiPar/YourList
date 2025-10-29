import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CreateItemRequest } from '@your-list/shared/data-access/data-access-api';

@Component({
  selector: 'your-list-add-item-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-item-form.html',
  styleUrl: './add-item-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddItemForm {
  @Output() public itemAdded = new EventEmitter<CreateItemRequest>();

  private formBuilder = inject(FormBuilder);

  public form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.maxLength(255)]],
  });

  public onSubmit(): void {
    if (this.form.valid) {
      const { name, description } = this.form.getRawValue();
      this.itemAdded.emit({
        name: name!,
        description: description || undefined,
      });
      this.form.reset();
    }
  }
}
