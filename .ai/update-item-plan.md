# API Endpoint Implementation Plan: Update Item

## 1. Przegląd punktu końcowego
Celem tego punktu końcowego jest umożliwienie uwierzytelnionym użytkownikom aktualizacji właściwości istniejącego przedmiotu (takich jak nazwa, opis lub status zakupu) na określonej liście zakupów. Użytkownik musi być właścicielem listy lub mieć do niej dostęp poprzez współdzielenie.

## 2. Szczegóły żądania
-   **Metoda HTTP:** `PATCH`
-   **Struktura URL:** `/api/lists/{listId}/items/{itemId}`
-   **Parametry:**
    -   **Wymagane:**
        -   `listId` (parametr ścieżki): Identyfikator listy zakupów (`BIGINT`).
        -   `itemId` (parametr ścieżki): Identyfikator przedmiotu do aktualizacji (`BIGINT`).
        -   `Authorization` (nagłówek): Token uwierzytelniający Bearer (`Bearer {token}`).
    -   **Opcjonalne:** Brak.
-   **Request Body:**
    -   Ciało żądania w formacie `application/json`.
    -   Wszystkie pola są opcjonalne, ale co najmniej jedno musi zostać podane.
    ```json
    {
      "name": "Nowa nazwa produktu",
      "description": "Nowy opis",
      "isBought": "BOOLEAN"
    }
    ```

## 3. Wykorzystywane typy
-   **Request DTO:** `org.example.yourlist.domain.item.dto.ItemDto.UpdateItemRequest`
-   **Response DTO:** `org.example.yourlist.domain.item.dto.ItemDto.ItemResponse`

## 4. Szczegóły odpowiedzi
-   **Odpowiedź sukcesu (200 OK):**
    -   Zwraca pełny, zaktualizowany obiekt przedmiotu w formacie `application/json`.
    ```json
    {
      "id": 1,
      "listId": 1,
      "name": "Nowa nazwa produktu",
      "description": "Nowy opis",
      "isBought": true,
      "createdAt": "2025-01-18T15:00:00Z"
    }
    ```
-   **Odpowiedzi błędów:**
    -   `400 Bad Request`: Nieprawidłowe dane wejściowe (np. zbyt długa nazwa, puste ciało żądania).
    -   `401 Unauthorized`: Brak lub nieprawidłowy token JWT.
    -   `403 Forbidden`: Użytkownik nie ma uprawnień do modyfikacji tej listy.
    -   `404 Not Found`: Lista lub przedmiot o podanych identyfikatorach nie istnieją.

## 5. Przepływ danych
1.  Żądanie `PATCH` trafia do `ItemController`.
2.  Spring Security weryfikuje token JWT. Jeśli jest nieprawidłowy, zwraca `401`.
3.  Kontroler wywołuje metodę w `ItemService`, przekazując `listId`, `itemId`, `UpdateItemRequest` oraz dane zalogowanego użytkownika.
4.  `ItemService` wykonuje następujące kroki:
    a. Sprawdza, czy użytkownik ma uprawnienia do listy o `listId` (jest właścicielem lub współpracownikiem). Jeśli nie, rzuca `ForbiddenException`.
    b. Pobiera encję `Item` z bazy danych na podstawie `itemId` i `listId`. Jeśli nie zostanie znaleziona, rzuca `ResourceNotFoundException`.
    c. Aktualizuje pola encji `Item` wartościami z `UpdateItemRequest`, jeśli nie są `null`.
    d. Zapisuje zaktualizowaną encję `Item` w bazie danych za pomocą `ItemRepository`.
    e. Trigger w bazie danych automatycznie aktualizuje pole `updated_at` w tabeli `shopping_lists`.
5.  `ItemService` mapuje zaktualizowaną encję `Item` na `ItemResponse` DTO i zwraca ją do kontrolera.
6.  `ItemController` zwraca `ItemResponse` z kodem statusu `200 OK`.

## 6. Względy bezpieczeństwa
-   **Uwierzytelnianie:** Dostęp do punktu końcowego jest chroniony przez Spring Security i wymaga prawidłowego tokenu JWT.
-   **Autoryzacja:** Logika w `ItemService` musi rygorystycznie sprawdzać, czy zalogowany użytkownik jest właścicielem listy (`shopping_lists.owner_id`) lub czy istnieje odpowiedni wpis w tabeli `shopping_list_shares`.
-   **Walidacja danych:**
    -   Adnotacje `@Size` w `UpdateItemRequest` DTO ograniczają długość pól tekstowych, chroniąc przed przepełnieniem bufora.
    -   Należy dodać walidację w serwisie, aby upewnić się, że ciało żądania nie jest całkowicie puste (wszystkie pola `null`).

## 7. Obsługa błędów
-   Błędy będą obsługiwane centralnie przez `GlobalExceptionHandler`.
-   **`ResourceNotFoundException`**: Rzucany przez serwis, gdy lista lub przedmiot nie zostaną znalezione. Mapowany na `404 Not Found`.
-   **`ForbiddenException`**: Rzucany przez serwis, gdy użytkownik nie ma uprawnień. Mapowany na `403 Forbidden`.
-   **`MethodArgumentNotValidException`**: Rzucany przez Spring, gdy walidacja DTO (np. `@Size`) nie powiedzie się. Mapowany na `400 Bad Request`.
-   **Błędy serwera (500):** Wszelkie inne, nieprzewidziane wyjątki będą logowane jako błędy krytyczne i mapowane na `500 Internal Server Error`.

## 8. Rozważania dotyczące wydajności
-   Zapytanie o przedmiot powinno być zoptymalizowane i wyszukiwać po kluczu głównym oraz kluczu obcym (`itemId` i `shopping_list_id`), co jest wydajne dzięki indeksom.
-   Sprawdzanie uprawnień wymaga dodatkowego zapytania do bazy danych, ale jest to konieczne ze względów bezpieczeństwa. Można to zoptymalizować, pobierając listę wraz z informacjami o uprawnieniach w jednym zapytaniu, jeśli to możliwe.
-   Operacja jest transakcyjna, co zapewnia spójność danych. Zgodnie z wytycznymi, transakcja powinna być jak najkrótsza.

## 9. Etapy wdrożenia
1.  **Kontroler (`ItemController`):**
    -   Dodać nową metodę obsługującą żądania `PATCH` na ścieżce `/api/lists/{listId}/items/{itemId}`.
    -   Użyć adnotacji `@PathVariable` do pobrania `listId` i `itemId`.
    -   Użyć adnotacji `@RequestBody` i `@Valid` dla `UpdateItemRequest`.
    -   Zabezpieczyć metodę za pomocą Spring Security.
    -   Wywołać odpowiednią metodę w `ItemService`.
2.  **Serwis (`ItemService`):**
    -   Stworzyć nową, publiczną metodę `updateItem(Long listId, Long itemId, UpdateItemRequest request, User currentUser)`.
    -   Zaimplementować logikę weryfikacji uprawnień użytkownika do listy.
    -   Zaimplementować logikę pobierania, aktualizacji i zapisywania encji `Item`.
    -   Dodać walidację sprawdzającą, czy `request` nie zawiera samych wartości `null`.
    -   Użyć `ItemMapper` do konwersji zaktualizowanej encji na `ItemResponse`.
    -   Oznaczyć metodę adnotacją `@Transactional`.
3.  **Repozytorium (`ItemRepository`):**
    -   Dodać nową metodę do wyszukiwania przedmiotu na podstawie jego ID i ID listy: `Optional<Item> findByIdAndShoppingListId(Long id, Long shoppingListId);`.
4.  **Testy:**
    -   Napisać testy jednostkowe dla nowej logiki w `ItemService`, uwzględniając przypadki sukcesu oraz scenariusze błędów (brak uprawnień, nieznaleziony zasób).
