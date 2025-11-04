import { Injectable, signal } from '@angular/core';
import { UserLoginResponse } from '@your-list/shared/data-access/data-access-api';


@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly tokenKey = 'yourlist_auth_token';
  public isAuthenticated = signal<boolean>(this.hasToken());

  public login(response: UserLoginResponse): void {
    if (response.token) {
      localStorage.setItem(this.tokenKey, response.token);
      this.isAuthenticated.set(true);
    }
  }

  public logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticated.set(false);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }
}
