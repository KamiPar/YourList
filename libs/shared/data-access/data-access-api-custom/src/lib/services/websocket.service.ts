import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AuthStateService } from './auth-state.service';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private readonly authStateService = inject(AuthStateService);
  private ws: WebSocket | null = null;
  private updateSubject = new Subject<any>();

  public connect(listId: number): void {
    const authToken = this.authStateService.getToken();

    if (!authToken) {
      console.error('Auth token is not available, WebSocket connection aborted.');
      return;
    }

    const wsUrl = `ws://localhost:8080/ws/lists/${listId}?token=${authToken}`;

    this.ws = new WebSocket(wsUrl);
    this.ws.onopen = () => {
      console.log('WebSocket connected for list:', listId);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.updateSubject.next(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public onUpdate(): Observable<any> {
    return this.updateSubject.asObservable();
  }
}
