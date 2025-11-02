import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private ws: WebSocket | null = null;
  private updateSubject = new Subject<any>();

  public connect(listId: number): void {
    const authToken =
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrYW1pbC5wYXJ0eWthMTk5OEBnbWFpbC5jb20iLCJpYXQiOjE3NjIwOTQzNzgsImV4cCI6MTc2MjA5Nzk3OH0.Etu4gHV7D8BYdfGMWp0qIt9Tiwr3R6r6snT_bly4aN4';

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
