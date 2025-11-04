import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationControllerRestService } from '@your-list/shared/data-access/data-access-api';
import { AuthStateService } from '@your-list/data-access-api-custom';

@Component({
  selector: 'your-list-feature-login',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './feature-login.html',
  styleUrl: './feature-login.scss',
})
export class FeatureLogin {
  public loginForm: FormGroup;
  public errorMessage = signal<string | null>(null);
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthenticationControllerRestService);
  private authState = inject(AuthStateService);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  public login(): void {
    if (!this.loginForm.valid) {
      return
    }

      this.errorMessage.set(null);
      this.authService
        .authenticate(this.loginForm.value)
        .pipe(
          tap((response) => {
            if (response) {
              this.authState.login(response);
              void this.router.navigate(['/lists']);
            }
          }),
          catchError((err: HttpErrorResponse) => {
            this.errorMessage.set('Invalid username or password');
            console.error(err)
            return of(null);
          })
        )
        .subscribe();
    }
}
