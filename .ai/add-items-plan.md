# API Endpoint Implementation Plan: Create Item

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia uwierzytelnionym użytkownikom dodawanie nowych produktów (itemów) do istniejącej listy zakupów. Endpoint jest kluczowym elementem funkcjonalności aplikacji, pozwalającym na dynamiczne rozbudowywanie list.

## 2. Szczegóły żądania
- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/lists/{listId}/items`
- **Parametry**:
  - **Path Variable**:
    - `listId` (wymagany): `Long`, identyfikator listy zakupów, do której dodawany jest produkt.
  - **Headers**:
    - `Authorization` (wymagany): `Bearer {token}` - token JWT uwierzytelniający użytkownika.
- **Request Body**:
  - **Struktura**:
    ```json
    {
      "name": "Milk",
      "description": "2 liters"
    }
    ```
  - **Pola**:
    - `name` (wymagany): `String`, nazwa produktu (maks. 255 znaków).
    - `description` (opcjonalny): `String`, dodatkowy opis, np. ilość (maks. 255 znaków).

## 3. Wykorzystywane typy
- **Request DTO**: `ItemDto.CreateItemRequest`
  - Służy do mapowania danych przychodzących z ciała żądania.
  - Zawiera adnotacje walidacyjne (`@NotNull`, `@Size`) do automatycznej weryfikacji danych wejściowych.
- **Response DTO**: `ItemDto.ItemResponse`
  - Służy do mapowania nowo utworzonej encji `Item` na odpowiedź API.
  - Zapewnia, że żadne wewnętrzne encje JPA nie są bezpośrednio wystawiane na zewnątrz, zgodnie z zasadami implementacji.

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (201 Created)**:
  - Zwraca nowo utworzony obiekt produktu.
  ```json
  {
    "id": 1,
    "listId": 1,
    "name": "Milk",
    "description": "2 liters",
    "isBought": false,
    "createdAt": "2025-01-18T15:00:00Z"
  }
  ```
- **Odpowiedzi błędów**:
  - `400 Bad Request`: Błędy walidacji (np. brak nazwy).
  - `401 Unauthorized`: Brak lub nieprawidłowy token JWT.
  - `403 Forbidden`: Użytkownik nie ma uprawnień do modyfikacji tej listy.
  - `404 Not Found`: Lista o podanym `listId` nie istnieje.

## 5. Przepływ danych
1.  **Controller**: `ItemController` odbiera żądanie `POST` na `/api/lists/{listId}/items`.
2.  **Spring Security**: `JwtAuthenticationFilter` weryfikuje token JWT i ustawia kontekst bezpieczeństwa z uwierzytelnionym użytkownikiem.
3.  **Controller**: Metoda kontrolera przyjmuje `listId` jako `@PathVariable` oraz ciało żądania jako `@RequestBody` z adnotacją `@Valid`, co uruchamia mechanizm Bean Validation.
4.  **Controller**: Wywołuje metodę `createItem` w `ItemService`, przekazując `listId`, DTO z żądania oraz obiekt aktualnie zalogowanego użytkownika.
5.  **Service (`ItemService`)**:
    a. Sprawdza, czy lista o podanym `listId` istnieje w bazie danych, korzystając z `ShoppingListRepository`. Jeśli nie, rzuca wyjątek `ResourceNotFoundException`.
    b. Weryfikuje, czy uwierzytelniony użytkownik ma uprawnienia do dodawania produktów do tej listy (jest właścicielem lub współpracownikiem). Jeśli nie, rzuca wyjątek `ForbiddenException`.
    c. Tworzy nową encję `Item` na podstawie danych z DTO.
    d. Zapisuje nową encję w bazie danych za pomocą `ItemRepository`.
    e. Mapuje zapisaną encję `Item` na `ItemDto.ItemResponse`.
6.  **Controller**: Otrzymuje DTO odpowiedzi z serwisu i zwraca je klientowi ze statusem `201 Created`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Dostęp do punktu końcowego jest chroniony przez Spring Security. Każde żądanie musi zawierać prawidłowy token JWT w nagłówku `Authorization`.
- **Autoryzacja**: Logika autoryzacji musi być zaimplementowana w warstwie serwisowej. Przed dodaniem produktu, system musi zweryfikować, czy zalogowany użytkownik jest właścicielem listy (`shopping_lists.owner_id`) lub czy istnieje odpowiedni wpis w tabeli `shopping_list_shares` łączący `user_id` z `shopping_list_id`.
- **Walidacja danych wejściowych**: Ciało żądania jest walidowane za pomocą adnotacji Bean Validation na DTO (`@NotNull`, `@Size`), co zapobiega atakom typu injection oraz błędom wynikającym z nieprawidłowych danych.

## 7. Obsługa błędów
Błędy będą centralnie zarządzane przez `GlobalExceptionHandler` (`@ControllerAdvice`).
- **`MethodArgumentNotValidException`**: Rzucany przez Spring, gdy walidacja `@Valid` na DTO zawiedzie. Handler mapuje go na odpowiedź `400 Bad Request` ze szczegółami błędów walidacji.
- **`ResourceNotFoundException` (custom)**: Rzucany z warstwy serwisowej, gdy lista o podanym `listId` nie zostanie znaleziona. Handler mapuje go na `404 Not Found`.
- **`ForbiddenException` (custom)**: Rzucany, gdy użytkownik nie ma uprawnień do listy. Handler mapuje go na `403 Forbidden`.
- **Błędy ogólne (`Exception`)**: Wszelkie inne, nieprzewidziane wyjątki będą przechwytywane i mapowane na `500 Internal Server Error`, a ich szczegóły logowane za pomocą SLF4J.

## 8. Rozważania dotyczące wydajności
- Operacja zapisu do bazy danych jest pojedynczym `INSERT`-em, co jest wysoce wydajne.
- Zapytania weryfikujące istnienie listy i uprawnienia użytkownika powinny być zoptymalizowane. Należy upewnić się, że odpowiednie kolumny (`shopping_lists.id`, `shopping_lists.owner_id`, `shopping_list_shares.user_id`, `shopping_list_shares.shopping_list_id`) są zaindeksowane w bazie danych.
- Nie przewiduje się problemów wydajnościowych dla tego punktu końcowego przy normalnym obciążeniu.

## 9. Etapy wdrożenia
1.  **Utworzenie Repozytorium**: Stworzyć interfejs `ItemRepository` rozszerzający `JpaRepository<Item, Long>`.
2.  **Utworzenie Mappera**: Stworzyć `ItemMapper` (np. używając MapStruct lub ręcznie) do konwersji między `ItemDto.CreateItemRequest` -> `Item` oraz `Item` -> `ItemDto.ItemResponse`.
3.  **Utworzenie Serwisu**:
    - Stworzyć klasę `ItemService`.
    - Wstrzyknąć zależności: `ItemRepository`, `ShoppingListRepository`, `ItemMapper`.
    - Zaimplementować metodę `createItem(Long listId, CreateItemRequest request, User currentUser)` zawierającą logikę biznesową, walidację uprawnień i zapis do bazy.
4.  **Utworzenie Kontrolera**:
    - Stworzyć klasę `ItemController` z adnotacją `@RestController` i ścieżką bazową `/api/lists/{listId}/items`.
    - Wstrzyknąć `ItemService`.
    - Zaimplementować metodę `createItem` z adnotacją `@PostMapping`, mapowaniem ścieżki, `@PathVariable`, `@RequestBody @Valid` oraz pobieraniem użytkownika z kontekstu bezpieczeństwa (`@AuthenticationPrincipal`).
5.  **Aktualizacja obsługi wyjątków**: Upewnić się, że `GlobalExceptionHandler` poprawnie obsługuje nowe, niestandardowe wyjątki (`ResourceNotFoundException`, `ForbiddenException`), jeśli jeszcze tego nie robi.
6.  **Testy**:
    - **Testy jednostkowe**: Napisać testy dla `ItemService`, mockując repozytoria i sprawdzając logikę biznesową oraz weryfikację uprawnień.
