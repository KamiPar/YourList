# API Endpoint Implementation Plan: Get Share Token

## 1. Przegląd punktu końcowego
Celem tego punktu końcowego jest bezpieczne pobranie tokenu udostępniania i adresu URL dla określonej listy zakupów. Dostęp jest ograniczony wyłącznie do właściciela listy, aby zapobiec nieautoryzowanemu dostępowi do linków udostępniania.

## 2. Szczegóły żądania
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/lists/{id}/share`
- **Parametry**:
  - **Wymagane**:
    - `id` (Path Parameter): Unikalny identyfikator (`BIGINT`) listy zakupów.
    - `Authorization` (Header): Token nośnika (Bearer Token) do uwierzytelniania użytkownika (JWT).
  - **Opcjonalne**: Brak.
- **Request Body**: Brak.

## 3. Wykorzystywane typy
- **Response DTO**: `org.example.yourlist.domain.list.dto.ShoppingListDto.ShareTokenResponse`
  ```java
  public record ShareTokenResponse(
      UUID shareToken,
      String shareUrl
  ) {}
  ```

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (200 OK)**: Zwraca obiekt JSON zawierający token udostępniania i pełny adres URL do dołączenia do listy.
  ```json
  {
    "shareToken": "550e8400-e29b-41d4-a716-446655440000",
    "shareUrl": "https://yourlist.app/join/550e8400-e29b-41d4-a716-446655440000"
  }
  ```
- **Odpowiedzi błędów**:
  - `401 Unauthorized`: Brakujący lub nieprawidłowy token JWT.
  - `403 Forbidden`: Uwierzytelniony użytkownik nie jest właścicielem listy.
  - `404 Not Found`: Lista o podanym `id` nie istnieje.

## 5. Przepływ danych
1.  Klient wysyła żądanie `GET` do `/api/lists/{id}/share` z prawidłowym nagłówkiem `Authorization`.
2.  Filtr Spring Security przechwytuje żądanie, waliduje token JWT i ustawia kontekst bezpieczeństwa z uwierzytelnionym użytkownikiem.
3.  Żądanie dociera do `ShoppingListController`. Metoda kontrolera wyodrębnia `id` z ścieżki i pobiera uwierzytelnionego użytkownika z kontekstu bezpieczeństwa.
4.  Kontroler wywołuje metodę w `ShoppingListService`, przekazując `id` listy i obiekt użytkownika.
5.  `ShoppingListService` pobiera encję `ShoppingList` z bazy danych za pomocą `ShoppingListRepository`.
    - Jeśli lista nie zostanie znaleziona, rzucany jest wyjątek `NotFoundException`.
6.  Serwis sprawdza, czy `owner_id` pobranej listy jest zgodny z ID uwierzytelnionego użytkownika.
    - Jeśli ID nie pasują, rzucany jest wyjątek `ForbiddenException`.
7.  Serwis konstruuje `shareUrl`, łącząc bazowy adres URL aplikacji (z pliku konfiguracyjnego `application.yaml`) z `share_token` z encji listy.
8.  Serwis mapuje `share_token` i `shareUrl` na DTO `ShareTokenResponse`.
9.  DTO jest zwracane do kontrolera, który serializuje je do formatu JSON i wysyła do klienta z kodem statusu `200 OK`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Zabezpieczone przez Spring Security przy użyciu JWT. Wszystkie żądania bez prawidłowego tokenu będą odrzucane z kodem `401 Unauthorized`.
- **Autoryzacja**: Kluczowym elementem jest weryfikacja, czy uwierzytelniony użytkownik jest właścicielem listy. Zapobiega to atakom typu IDOR (Insecure Direct Object Reference), gdzie użytkownik mógłby próbować odgadnąć ID listy, aby uzyskać dostęp do jej tokenu udostępniania.
- **Walidacja danych**:
  - Identyfikator listy (`id`) w ścieżce jest automatycznie walidowany przez framework jako prawidłowy typ liczbowy.
  - Nie ma innych danych wejściowych od użytkownika do walidacji.

## 7. Obsługa błędów
Obsługa błędów będzie scentralizowana przy użyciu adnotacji `@ControllerAdvice`, zgodnie z wytycznymi implementacji.
- **`NotFoundException`**: Rzucany przez warstwę serwisową, gdy lista o podanym `id` nie istnieje. Przechwytywany przez `ControllerAdvice` i mapowany na odpowiedź `404 Not Found`.
- **`ForbiddenException`**: Rzucany przez warstwę serwisową, gdy użytkownik próbuje uzyskać dostęp do listy, której nie jest właścicielem. Przechwytywany przez `ControllerAdvice` i mapowany na odpowiedź `403 Forbidden`.
- **Błędy ogólne**: Wszelkie inne nieoczekiwane wyjątki (np. problemy z bazą danych) będą przechwytywane i mapowane na odpowiedź `500 Internal Server Error`. Błędy będą logowane przy użyciu SLF4J.

## 8. Rozważania dotyczące wydajności
- Zapytanie do bazy danych w celu pobrania listy po jej kluczu głównym jest wysoce zoptymalizowane i wydajne.
- Nie przewiduje się problemów z wydajnością, ponieważ operacja obejmuje proste pobranie danych i sprawdzenie uprawnień.
- Zgodnie z wytycznymi, operacja będzie oznaczona jako `@Transactional(readOnly = true)`, co może zapewnić dodatkowe optymalizacje na poziomie dostawcy JPA.

## 9. Etapy wdrożenia
1.  **Aktualizacja `ShoppingListController`**:
    - Dodaj nową metodę obsługującą żądanie `GET /api/lists/{id}/share`.
    - Użyj adnotacji `@GetMapping("/{id}/share")`.
    - Zabezpiecz metodę, aby wymagała uwierzytelnienia.
    - Wstrzyknij `ShoppingListService`.
    - Pobierz `id` listy z `@PathVariable` i uwierzytelnionego użytkownika z `AuthenticationPrincipal`.
    - Wywołaj nową metodę w serwisie i zwróć wynik `ShareTokenResponse` z kodem statusu `200 OK`.

2.  **Aktualizacja `ShoppingListService`**:
    - Dodaj nową metodę, np. `getShareTokenForOwner(Long listId, User currentUser)`.
    - Oznacz metodę jako `@Transactional(readOnly = true)`.
    - Zaimplementuj logikę opisaną w sekcji "Przepływ danych":
        a. Znajdź listę w `shoppingListRepository` lub rzuć `NotFoundException`.
        b. Sprawdź, czy `currentUser` jest właścicielem listy, w przeciwnym razie rzuć `ForbiddenException`.
        c. Wstrzyknij bazowy adres URL aplikacji z właściwości (np. `@Value("${app.base-url}")`).
        d. Skonstruuj pełny `shareUrl`.
        e. Utwórz i zwróć instancję `ShareTokenResponse`.

3.  **Konfiguracja**:
    - Upewnij się, że właściwość `app.base-url` jest zdefiniowana w pliku `application.yaml`.

4.  **Testy**:
    - **Testy jednostkowe**: Utwórz testy dla `ShoppingListService`, aby zweryfikować:
        - Pomyślne pobranie tokenu przez właściciela.
        - Rzucenie `NotFoundException` dla nieistniejącej listy.
        - Rzucenie `ForbiddenException`, gdy użytkownik nie jest właścicielem.
    - **Testy integracyjne**: Utwórz testy dla `ShoppingListController`, aby zweryfikować:
        - Poprawną odpowiedź `200 OK` z oczekiwanymi danymi dla właściciela.
        - Odpowiedź `401 Unauthorized` dla żądań bez tokenu.
        - Odpowiedź `403 Forbidden` dla żądań od użytkownika niebędącego właścicielem.
        - Odpowiedź `404 Not Found` dla nieprawidłowego ID listy.
