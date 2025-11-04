import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AuthenticationControllerRestService,
  UserLoginRequest,
} from '@your-list/shared/data-access/data-access-api';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthStateService } from '@your-list/data-access-api-custom';

@Component({
  selector: 'your-list-feature-register',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './feature-register.html',
  styleUrl: './feature-register.scss',
})
export class FeatureRegister {
  public registerForm: FormGroup;
  public errorMessage = signal<string | null>(null);
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthenticationControllerRestService);
  private authState = inject(AuthStateService);
  private router = inject(Router);

  constructor() {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  public register(): void {
    if (this.registerForm.valid) {
      this.errorMessage.set(null);
      const { email, password } = this.registerForm.value;
      this.authService
        .register(this.registerForm.value)
        .pipe(
          switchMap(() => {
            const loginRequest: UserLoginRequest = {  email, password };
            return this.authService.authenticate(loginRequest);
          }),
          tap((response) => {
            if (response) {
              this.authState.login(response);
              this.router.navigate(['/lists']);
            }
          }),
          catchError((err: HttpErrorResponse) => {
            this.errorMessage.set('Registration failed. Please try again.');
            console.error(err)
            return of(null);
          })
        )
        .subscribe();
    }
  }
}
