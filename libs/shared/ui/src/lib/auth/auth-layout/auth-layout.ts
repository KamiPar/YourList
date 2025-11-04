import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthStateService } from '@your-list/data-access-api-custom';

@Component({
  selector: 'your-list-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './auth-layout.html',
  styleUrls: ['./auth-layout.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {
  public readonly isAuthenticated;
  private readonly authStateService = inject(AuthStateService)

  constructor() {
    this.isAuthenticated = this.authStateService.isAuthenticated;
  }

  public logout(): void {
    this.authStateService.logout();
  }
}
