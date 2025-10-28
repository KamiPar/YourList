import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { MatDialogRef } from '@angular/material/dialog';
import { map, Observable, startWith } from 'rxjs';
import { ShoppingListControllerRestService, ShoppingListResponse } from '@your-list/shared/data-access/data-access-api';

@Component({
  selector: 'your-list-create-list-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-list-modal.html',
  styleUrl: './create-list-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateListModal implements OnInit {
  private fb = inject(FormBuilder);
  private shoppingListControllerRestService = inject(ShoppingListControllerRestService);
  public dialogRef = inject(MatDialogRef<CreateListModal>);

  public form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
  });

  public nameErrors$!: Observable<{
    show: boolean;
    required: boolean;
    maxlength: boolean;
  }>;

  public ngOnInit(): void {
    const nameControl = this.form.get('name');
    if (nameControl) {
      this.nameErrors$ = nameControl.statusChanges.pipe(
        startWith(nameControl.status),
        map(() => {
          const show = !!(nameControl.invalid && (nameControl.dirty || nameControl.touched));
          return {
            show,
            required: show && nameControl.hasError('required'),
            maxlength: show && nameControl.hasError('maxlength'),
          };
        })
      );
    }
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.shoppingListControllerRestService.createList({ name: this.form.get('name')?.value }).subscribe({
      next: (newList: ShoppingListResponse) => {
        this.dialogRef.close(newList);
      },
      error: (err: HttpErrorResponse) => {
        // TODO: Handle error (e.g., show a toast message)
        console.error('Error creating list:', err);
      },
    });
  }

  public onCancel(): void {
    this.dialogRef.close();
  }
}
