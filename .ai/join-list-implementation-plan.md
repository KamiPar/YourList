# API Endpoint Implementation Plan: Join Shared List

## 1. Przegląd punktu końcowego
Celem tego punktu końcowego jest umożliwienie uwierzytelnionemu użytkownikowi dołączenia do istniejącej, współdzielonej listy zakupów za pomocą unikalnego tokenu (`shareToken`). Po pomyślnym dołączeniu, użytkownik staje się współpracownikiem listy i otrzymuje jej szczegóły w odpowiedzi.

## 2. Szczegóły żądania
- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/lists/join`
- **Nagłówki**:
  - `Authorization: Bearer {token}` (Wymagany)
- **Ciało żądania**:
  ```json
  {
    "shareToken": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```
- **Parametry**:
  - **Wymagane**: `shareToken` (w ciele żądania, musi być prawidłowym UUID).
  - **Opcjonalne**: Brak.

## 3. Wykorzystywane typy
- **Request DTO**: `org.example.yourlist.domain.list.dto.ShoppingListDto.JoinShoppingListRequest`
- **Response DTO**: `org.example.yourlist.domain.list.dto.ShoppingListDto.ShoppingListResponse`

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (200 OK)**:
  ```json
  {
    "id": 1,
    "name": "Weekly Groceries",
    "ownerId": 2,
    "isOwner": false,
    "shareToken": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-01-18T15:00:00Z",
    "updatedAt": "2025-01-18T16:30:00Z"
  }
  ```
- **Odpowiedzi błędów**:
  - `400 Bad Request`: Nieprawidłowy format `shareToken`.
  - `401 Unauthorized`: Brak lub nieprawidłowy token JWT.
  - `404 Not Found`: Lista o podanym `shareToken` nie istnieje.
  - `409 Conflict`: Użytkownik jest już właścicielem lub członkiem tej listy.

## 5. Przepływ danych
1.  Użytkownik wysyła żądanie `POST` na `/api/lists/join` z tokenem JWT w nagłówku i `shareToken` w ciele.
2.  Filtr Spring Security przechwytuje żądanie, waliduje token JWT i ustawia kontekst bezpieczeństwa z danymi uwierzytelnionego użytkownika.
3.  Żądanie trafia do `ShoppingListController`. Ciało żądania jest deserializowane do DTO `JoinShoppingListRequest`.
4.  Kontroler wywołuje metodę `joinSharedList` w `ShoppingListService`, przekazując DTO oraz obiekt `User` z kontekstu bezpieczeństwa.
5.  `ShoppingListService` wykonuje logikę biznesową:
    a. Wyszukuje `ShoppingList` w bazie danych po `shareToken` za pomocą `ShoppingListRepository`.
    b. Jeśli lista nie zostanie znaleziona, rzuca `ResourceNotFoundException`.
    c. Sprawdza, czy `owner_id` listy jest taki sam jak ID bieżącego użytkownika. Jeśli tak, rzuca `UserAlreadyHasAccessException`.
    d. Sprawdza, czy istnieje już wpis w tabeli `shopping_list_shares` dla tej listy i użytkownika za pomocą `ShoppingListShareRepository`. Jeśli tak, rzuca `UserAlreadyHasAccessException`.
    e. Jeśli wszystkie warunki są spełnione, tworzy nową encję `ShoppingListShare`, ustawia w niej referencje do listy i użytkownika, a następnie zapisuje ją w bazie danych.
6.  `ShoppingListService` mapuje znalezioną encję `ShoppingList` na DTO `ShoppingListResponse` i zwraca ją do kontrolera.
7.  `ShoppingListController` zwraca DTO z kodem statusu `200 OK`.
8.  Centralny `ControllerAdvice` przechwytuje ewentualne wyjątki i mapuje je na odpowiednie odpowiedzi HTTP (404, 409).

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Endpoint musi być zabezpieczony i dostępny tylko dla ról `USER` lub równoważnych. Należy dodać odpowiednią adnotację (`@PreAuthorize("isAuthenticated()")`) lub konfigurację w `SecurityConfiguration`.
- **Autoryzacja**: Logika serwisu musi precyzyjnie weryfikować, czy użytkownik nie jest już właścicielem lub członkiem listy, aby zapobiec redundantnym wpisom i potencjalnym błędom integralności danych.
- **Walidacja danych**: Użycie typu `UUID` dla `shareToken` oraz adnotacji walidacyjnych (`@NotNull`, `@Valid`) chroni przed nieprawidłowymi danymi wejściowymi.

## 7. Rozważania dotyczące wydajności
- Operacje bazodanowe są kluczowe dla wydajności. Należy zapewnić, że kolumna `share_token` w tabeli `shopping_lists` jest zindeksowana (domyślnie jest, ponieważ ma ograniczenie `UNIQUE`).
- Zapytanie sprawdzające istnienie wpisu w `shopping_list_shares` powinno być wydajne, co jest zapewnione przez użycie klucza głównego złożonego (`shopping_list_id`, `user_id`).
- Transakcyjność: Cała operacja w metodzie serwisowej powinna być objęta transakcją (`@Transactional`), aby zapewnić spójność danych. W przypadku błędu po sprawdzeniu warunków, a przed zapisem, transakcja zostanie wycofana.

## 8. Etapy wdrożenia
1.  **Utworzenie repozytorium**:
    - Stworzyć interfejs `ShoppingListShareRepository` rozszerzający `JpaRepository<ShoppingListShare, ShoppingListShareId>`.
    - Dodać metodę `existsByShoppingListIdAndUserId(Long listId, Long userId)` dla łatwiejszego sprawdzania istnienia powiązania.
2.  **Aktualizacja serwisu (`ShoppingListService`)**:
    - Wstrzyknąć `ShoppingListRepository` i `ShoppingListShareRepository`.
    - Zaimplementować nową publiczną metodę `joinSharedList(JoinShoppingListRequest request, User currentUser)`.
    - Wewnątrz metody zaimplementować logikę opisaną w sekcji "Przepływ danych".
    - Upewnić się, że metoda jest oznaczona adnotacją `@Transactional`.
3.  **Aktualizacja kontrolera (`ShoppingListController`)**:
    - Dodać nową metodę obsługującą `POST /api/lists/join`.
    - Metoda powinna przyjmować `@Valid @RequestBody JoinShoppingListRequest` oraz `@AuthenticationPrincipal User currentUser`.
    - Zabezpieczyć metodę, aby wymagała uwierzytelnienia.
    - Wywołać metodę `joinSharedList` z serwisu i zwrócić wynik jako `ShoppingListResponse` z kodem `200 OK`.
4.  **Obsługa wyjątków**:
    - Stworzyć niestandardowy wyjątek `UserAlreadyHasAccessException` rozszerzający `RuntimeException`.
    - W globalnym `ControllerAdvice` dodać metodę obsługującą ten wyjątek, która zwróci odpowiedź z kodem statusu `409 Conflict`.
5.  **Testy**:
    - Napisać testy jednostkowe dla `ShoppingListService`, pokrywające scenariusz sukcesu oraz wszystkie przypadki błędów (lista nie istnieje, użytkownik jest właścicielem, użytkownik jest już członkiem).
    - Napisać testy integracyjne dla `ShoppingListController`, które sprawdzą działanie całego endpointu, włączając w to walidację, bezpieczeństwo i poprawność odpowiedzi.
