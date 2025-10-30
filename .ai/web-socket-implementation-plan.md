# API Endpoint Implementation Plan: Real-time List Updates via WebSocket

## 1. Przegląd punktu końcowego
Celem tego punktu końcowego jest umożliwienie klientom subskrybowania aktualizacji w czasie rzeczywistym dla określonej listy zakupów. Po nawiązaniu połączenia WebSocket, serwer będzie wysyłał komunikaty o zdarzeniach takich jak dodanie, aktualizacja lub usunięcie przedmiotu, a także o aktualizacji danych samej listy.

## 2. Szczegóły żądania
- **Metoda**: `WebSocket`
- **Struktura URL**: `/ws/lists/{listId}`
- **Parametry**:
  - **Wymagane**:
    - `listId` (Path Parameter): Identyfikator listy zakupów do subskrybowania.
    - `Authorization` (Header): `Bearer {token}` - Token JWT do uwierzytelnienia użytkownika. Token będzie przekazywany podczas początkowego żądania HTTP "Upgrade".
- **Request Body**: Nie dotyczy dla połączeń WebSocket.

## 3. Wykorzystywane typy
- **DTO dla wiadomości wychodzących**:
  - `ItemDto.ItemResponse` dla zdarzeń `ITEM_ADDED` i `ITEM_UPDATED`.
  - `ItemDto.ItemDeletedWs` dla zdarzenia `ITEM_DELETED`.
  - `ShoppingListDto.ShoppingListUpdatedWs` dla zdarzenia `LIST_UPDATED`.
- **Struktura opakowująca wiadomość**:
  - Zostanie stworzony generyczny rekord `WebSocketMessage<T>` do ujednolicenia formatu wszystkich wiadomości.
  ```java
  public record WebSocketMessage<T>(
      String type,
      java.time.Instant timestamp,
      T data
  ) {}
  ```

## 4. Przepływ danych
1.  Klient wysyła żądanie HTTP `Upgrade` na adres `/ws/lists/{listId}` z nagłówkiem `Authorization`.
2.  `WebSocketHandshakeInterceptor` przechwytuje żądanie, weryfikuje token JWT i sprawdza, czy użytkownik ma uprawnienia do listy (`listId`).
3.  Jeśli walidacja przebiegnie pomyślnie, połączenie jest uaktualniane do WebSocket, a sesja jest rejestrowana w `WebSocketUpdateService`.
4.  Gdy inny użytkownik (lub ten sam) wykonuje operację CRUD na liście lub jej przedmiotach (np. przez standardowe endpointy REST API), odpowiedni serwis (`ItemService`, `ShoppingListService`) wywołuje metodę w `WebSocketUpdateService`.
5.  `WebSocketUpdateService` tworzy odpowiednią wiadomość (`WebSocketMessage`) i rozgłasza ją do wszystkich aktywnych sesji subskrybujących daną `listId`.
6.  Klient otrzymuje wiadomość w formacie JSON i aktualizuje swój interfejs użytkownika.

## 5. Względy bezpieczeństwa
- **Uwierzytelnianie**: Każde żądanie nawiązania połączenia WebSocket musi być uwierzytelnione za pomocą ważnego tokena JWT. Implementacja `ChannelInterceptor` lub `HandshakeInterceptor` będzie odpowiedzialna za walidację tokena przed nawiązaniem połączenia.
- **Autoryzacja**: Po pomyślnym uwierzytelnieniu, system musi zweryfikować, czy użytkownik ma prawo dostępu do listy o podanym `listId`. Dostęp jest przyznawany właścicielowi listy oraz użytkownikom, którzy mają wpis w tabeli `shopping_list_shares`.
- **Zarządzanie sesją**: Sesje WebSocket muszą być bezpiecznie zarządzane i zamykane, gdy użytkownik się wyloguje lub jego uprawnienia zostaną cofnięte.

## 6. Obsługa błędów
Błędy będą obsługiwane na dwóch etapach:
- **Podczas nawiązywania połączenia (HTTP Handshake)**:
  - **401 Unauthorized**: Zwracany, gdy token JWT jest nieobecny, nieprawidłowy lub wygasł.
  - **403 Forbidden**: Zwracany, gdy użytkownik jest uwierzytelniony, ale nie ma uprawnień do subskrybowania danej listy.
  - **404 Not Found**: Zwracany, gdy lista o podanym `listId` nie istnieje.
- **Po nawiązaniu połączenia**:
  - W przypadku błędu po stronie serwera (np. problem z serializacją danych), błąd zostanie zarejestrowany za pomocą SLF4J, a połączenie może zostać zamknięte z odpowiednim kodem statusu.
  - Jeśli uprawnienia użytkownika do listy zostaną odebrane w trakcie aktywnej sesji, serwer powinien proaktywnie zamknąć połączenie.

## 7. Rozważania dotyczące wydajności
- **Zarządzanie połączeniami**: Należy efektywnie zarządzać cyklem życia połączeń WebSocket, aby unikać wycieków pamięci. Użycie `ConcurrentHashMap` do przechowywania sesji (`Map<Long, List<WebSocketSession>>`) zapewni bezpieczeństwo wątkowe i wydajność.
- **Rozgłaszanie wiadomości**: Wiadomości powinny być wysyłane asynchronicznie, aby uniknąć blokowania wątku wykonującego logikę biznesową.
- **Skalowalność**: W przypadku wdrożenia na wielu instancjach, należy rozważyć użycie zewnętrznego brokera wiadomości (np. Redis Pub/Sub, RabbitMQ) do synchronizacji i rozgłaszania wiadomości WebSocket pomiędzy instancjami.

## 8. Etapy wdrożenia
1.  **Konfiguracja WebSocket**:
    - Dodać zależność `spring-boot-starter-websocket` do `build.gradle`.
    - Stworzyć klasę konfiguracyjną z adnotacją `@Configuration` i `@EnableWebSocket`, która implementuje `WebSocketConfigurer` w celu rejestracji `WebSocketHandler`.
2.  **Implementacja DTO**:
    - Stworzyć generyczny rekord `WebSocketMessage<T>` do opakowywania wszystkich wiadomości.
3.  **Implementacja `WebSocketHandler`**:
    - Stworzyć klasę `ListUpdatesWebSocketHandler` rozszerzającą `TextWebSocketHandler`.
    - Zaimplementować metody `afterConnectionEstablished` i `afterConnectionClosed` do zarządzania cyklem życia sesji.
    - Metoda `handleTextMessage` może pozostać pusta, ponieważ komunikacja jest jednokierunkowa (serwer -> klient).
4.  **Implementacja `WebSocketUpdateService`**:
    - Stworzyć serwis odpowiedzialny za zarządzanie sesjami i rozgłaszanie wiadomości.
    - Będzie on zawierał metody takie jak `registerSession(listId, session)`, `removeSession(session)` oraz metody do rozgłaszania konkretnych zdarzeń (`broadcastItemAdded`, `broadcastItemUpdated`, etc.).
5.  **Implementacja `HandshakeInterceptor`**:
    - Stworzyć interceptor, który będzie weryfikował token JWT i uprawnienia użytkownika przed nawiązaniem połączenia.
    - W przypadku niepowodzenia walidacji, interceptor powinien zwrócić odpowiedni kod błędu HTTP (401, 403, 404).
6.  **Integracja z istniejącymi serwisami**:
    - W `ItemService` i `ShoppingListService`, po każdej operacji modyfikacji danych, wstrzyknąć `WebSocketUpdateService` i wywołać odpowiednią metodę rozgłaszającą.
    - Upewnić się, że wywołania te następują tylko po pomyślnym zatwierdzeniu transakcji w bazie danych (np. używając `TransactionSynchronizationManager.registerSynchronization`).
7.  **Logowanie i testowanie**:
    - Dodać logowanie SLF4J do kluczowych operacji (nawiązywanie/zamykanie połączeń, błędy).
    - Napisać testy jednostkowe dla logiki w serwisach i interceptorze.
    - Przeprowadzić testy integracyjne z użyciem klienta WebSocket (np. `Stomp.js` po stronie frontendu lub narzędzia takie jak Postman) w celu weryfikacji całego przepływu.
