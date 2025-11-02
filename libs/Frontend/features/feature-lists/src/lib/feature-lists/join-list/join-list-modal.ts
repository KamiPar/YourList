import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import {
  ShoppingListControllerRestService,
  ShoppingListResponse,
} from '@your-list/shared/data-access/data-access-api';

@Component({
  selector: 'your-list-join-list-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './join-list-modal.html',
  styleUrls: ['./join-list-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinListModal {
  private dialogRef = inject(MatDialogRef<JoinListModal>);
  private shoppingListControllerRestService = inject(
    ShoppingListControllerRestService
  );

  public joinListForm = new FormGroup({
    shareToken: new FormControl('', [Validators.required]),
  });

  public joinList(): void {
    if (this.joinListForm.valid && this.joinListForm.value.shareToken) {
      this.shoppingListControllerRestService
        .joinSharedList({ shareToken: this.joinListForm.value.shareToken })
        .subscribe({
          next: (response: ShoppingListResponse) => {
            this.dialogRef.close(response);
          },
          error: (err) => {
            // TODO: Handle error (e.g., show a toast message)
            console.error('Error joining list:', err);
            this.joinListForm.get('shareToken')?.setErrors({ invalidToken: true });
          },
        });
    }
  }

  public onCancel(): void {
    this.dialogRef.close();
  }
}
