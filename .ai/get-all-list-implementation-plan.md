# API Endpoint Implementation Plan: Get All Lists

## 1. Przegląd punktu końcowego
Celem tego punktu końcowego jest umożliwienie uwierzytelnionym użytkownikom pobierania paginowanej i posortowanej listy wszystkich list zakupów, których są właścicielami lub które zostały im udostępnione. Odpowiedź zawierać będzie podsumowanie każdej listy, w tym zagregowane dane, takie jak liczba produktów.

## 2. Szczegóły żądania
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/lists`
- **Nagłówki**:
  - `Authorization`: `Bearer {token}` (wymagany)
- **Parametry zapytania**:
  - `page` (opcjonalny, domyślnie: 0): Numer strony do pobrania.
  - `size` (opcjonalny, domyślnie: 20): Liczba list na stronie.
  - `sort` (opcjonalny, domyślnie: `updatedAt,desc`): Właściwość i kierunek sortowania (np. `name,asc`).
- **Request Body**: Brak.

## 3. Wykorzystywane typy
- **DTO odpowiedzi**: `ShoppingListDto.ShoppingListSummaryResponse`
- **Struktura odpowiedzi**: `org.springframework.data.domain.Page<ShoppingListSummaryResponse>`

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (200 OK)**:
  ```json
  {
    "content": [
      {
        "id": 1,
        "name": "Weekly Groceries",
        "ownerId": 1,
        "isOwner": true,
        "shareToken": "550e8400-e29b-41d4-a716-446655440000",
        "createdAt": "2025-01-18T15:00:00Z",
        "updatedAt": "2025-01-18T16:30:00Z",
        "itemCount": 5,
        "boughtItemCount": 2
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1
  }
  ```
- **Odpowiedzi błędów**:
  - `401 Unauthorized`: Brak lub nieprawidłowy token JWT.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera.

## 5. Przepływ danych
1.  Żądanie `GET /api/lists` trafia do `ShoppingListController`.
2.  Filtr `JwtAuthenticationFilter` weryfikuje token JWT i umieszcza dane uwierzytelnionego użytkownika w `SecurityContext`.
3.  Metoda kontrolera przyjmuje obiekt `Pageable` (stworzony przez Spring na podstawie parametrów `page`, `size`, `sort`) oraz `AuthenticationPrincipal` (reprezentujący zalogowanego użytkownika).
4.  Kontroler wywołuje metodę w `ShoppingListService`, np. `findAllListsForUser(currentUser, pageable)`.
5.  Serwis wywołuje niestandardową metodę w `ShoppingListRepository`, która wykonuje zapytanie SQL/JPQL.
6.  Zapytanie w repozytorium pobiera listy, których użytkownik jest właścicielem (`owner_id = :userId`) LUB do których ma dostęp przez tabelę `shopping_list_shares`. Zapytanie to musi również obliczać zagregowane wartości `itemCount` i `boughtItemCount`.
7.  Wyniki z bazy danych są mapowane na obiekty `ShoppingListSummaryResponse`. Mapper musi ustawić flagę `isOwner` na podstawie porównania `ownerId` z ID bieżącego użytkownika.
8.  Serwis zwraca `Page<ShoppingListSummaryResponse>` do kontrolera.
9.  Kontroler zwraca odpowiedź w formacie JSON z kodem statusu 200 OK.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Dostęp do punktu końcowego musi być ograniczony do uwierzytelnionych użytkowników. Należy to zapewnić za pomocą konfiguracji Spring Security (`.requestMatchers("/api/lists").authenticated()`).
- **Autoryzacja (Izolacja danych)**: Logika w `ShoppingListRepository` musi rygorystycznie filtrować wyniki, aby zwracać tylko te listy, które są powiązane z uwierzytelnionym użytkownikiem. Identyfikator użytkownika musi być pobierany wyłącznie z kontekstu bezpieczeństwa (`AuthenticationPrincipal`).

## 7. Obsługa błędów
- **401 Unauthorized**: Obsługiwane przez framework Spring Security. Nie jest wymagana dodatkowa implementacja w kontrolerze.
- **500 Internal Server Error**: Wszelkie nieprzewidziane wyjątki (np. `SQLException`) będą przechwytywane przez globalny `ControllerAdvice` (`GlobalExceptionHandler`), logowane za pomocą SLF4J i zwracane jako standardowy obiekt błędu z kodem 500.

## 8. Rozważania dotyczące wydajności
- **Zapytanie do bazy danych**: Należy unikać problemu N+1. Zapytanie powinno być zoptymalizowane tak, aby pobrać wszystkie wymagane dane (w tym zagregowane liczniki) w jednym zapytaniu do bazy danych. Użycie projekcji DTO (zamiast encji) jest zalecane.
- **Indeksowanie**: Kolumny `owner_id` w tabeli `shopping_lists` oraz klucze obce w tabeli `shopping_list_shares` powinny być zaindeksowane, aby zapewnić wysoką wydajność złączeń i filtrowania.
- **Paginacja**: Implementacja paginacji na poziomie bazy danych jest kluczowa dla wydajności przy dużych zbiorach danych.

## 9. Etapy wdrożenia
1.  **Aktualizacja `ShoppingListRepository`**:
    -   Dodaj nową metodę, np. `findAllForUser(Long userId, Pageable pageable)`.
    -   Użyj adnotacji `@Query` z zapytaniem JPQL lub natywnym SQL, które:
        -   Łączy `shopping_lists` z `shopping_list_shares` (LEFT JOIN).
        -   Filtruje wyniki, gdzie `sl.owner_id = :userId` LUB `sls.user_id = :userId`.
        -   Używa podzapytań lub `LEFT JOIN` z `items` i `COUNT` do obliczenia `itemCount` i `boughtItemCount`.
        -   Zwraca `Page<ShoppingListSummaryResponse>`.

2.  **Aktualizacja `ShoppingListService`**:
    -   Utwórz nową metodę `findAllListsForUser(User currentUser, Pageable pageable)`.
    -   Wewnątrz metody wywołaj `shoppingListRepository.findAllForUser(currentUser.getId(), pageable)`.
    -   Logika mapowania `isOwner` powinna być częścią zapytania SQL/JPQL lub wykonana w serwisie po pobraniu danych.

3.  **Aktualizacja `ShoppingListController`**:
    -   Dodaj nową metodę obsługującą żądania `GET` na `/api/lists`.
    -   Metoda powinna przyjmować `@AuthenticationPrincipal User currentUser` oraz `Pageable pageable` jako argumenty.
    -   Wywołaj odpowiednią metodę z `ShoppingListService` i zwróć jej wynik.
    -   Użyj adnotacji `@ResponseStatus(HttpStatus.OK)`.

4.  **Testy**:
    -   Napisz testy jednostkowe dla `ShoppingListService`, mockując repozytorium.
