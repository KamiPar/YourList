import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';

export interface ShareBottomSheetData {
  shareToken: string;
}

@Component({
  selector: 'your-list-share-bottom-sheet',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    MatButton,
    MatIcon,
    MatLabel,
    MatIconButton,
  ],
  templateUrl: './share-bottom-sheet.html',
  styleUrl: './share-bottom-sheet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareBottomSheet {
  public data: ShareBottomSheetData = inject(MAT_BOTTOM_SHEET_DATA);
  private readonly bottomSheetRef = inject(MatBottomSheetRef<ShareBottomSheet>);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  public onCopy(): void {
    const copied = this.clipboard.copy(this.data.shareToken);
    if (copied) {
      this.snackBar.open('Token skopiowany!', 'Zamknij', { duration: 2000 });
    } else {
      this.snackBar.open('Błąd kopiowania tokenu.', 'Zamknij', {
        duration: 2000,
      });
    }
    this.bottomSheetRef.dismiss();
  }

  public onCancel(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
