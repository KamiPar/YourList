# API Endpoint Implementation Plan: Get List Items

## 1. Przegląd punktu końcowego
Celem tego punktu końcowego jest umożliwienie uwierzytelnionym użytkownikom pobierania wszystkich produktów (items) powiązanych z konkretną listą zakupów, identyfikowaną przez jej `listId`. Punkt końcowy zwróci tablicę obiektów reprezentujących produkty, jeśli użytkownik ma odpowiednie uprawnienia dostępu do listy.

## 2. Szczegóły żądania
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/lists/{listId}/items`
- **Parametry**:
  - **Wymagane**:
    - `listId` (Path Variable): `Long` - Unikalny identyfikator listy zakupów.
    - `Authorization` (Header): `Bearer {token}` - Token JWT uwierzytelniający użytkownika.
  - **Opcjonalne**: Brak.
- **Request Body**: Brak.

## 3. Wykorzystywane typy
W celu zwrócenia danych zgodnych ze specyfikacją (`listName`), konieczne jest zaktualizowanie istniejącego dto 

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (200 OK)**: Zwraca tablicę obiektów `ItemWithListNameResponse`.
  ```json
  [
    {
      "id": 1,
      "listId": 1,
      "listName": "firstList",
      "name": "Milk",
      "description": "2 liters",
      "isBought": false,
      "createdAt": "2025-01-18T15:00:00Z"
    }
  ]
  ```
- **Odpowiedź błędu**: Zwraca standardowy obiekt `ProblemDetail` zgodnie z konfiguracją `GlobalExceptionHandler`.

## 5. Przepływ danych
1.  Użytkownik wysyła żądanie `GET` na adres `/api/lists/{listId}/items` z prawidłowym tokenem JWT.
2.  `JwtAuthenticationFilter` przechwytuje żądanie, waliduje token i ustawia kontekst bezpieczeństwa.
3.  Żądanie trafia do metody w `ItemController` (lub `ShoppingListController`, w zależności od organizacji kodu).
4.  Kontroler wywołuje metodę w `ItemService`, np. `findAllItemsByListId(listId)`.
5.  `ItemService` najpierw wywołuje `ShoppingListService`, aby zweryfikować, czy lista o podanym `listId` istnieje i czy bieżący użytkownik ma do niej uprawnienia (jest właścicielem lub ma udostępnioną).
6.  Jeśli weryfikacja uprawnień się nie powiedzie, `ShoppingListService` rzuca wyjątek `ResourceNotFoundException`.
7.  Jeśli weryfikacja się powiedzie, `ItemService` wywołuje metodę w `ItemRepository` w celu pobrania wszystkich encji `Item` dla danego `shopping_list_id`. Zapytanie powinno zawierać złączenie (join) z tabelą `shopping_lists` w celu pobrania nazwy listy, aby uniknąć problemu N+1.
8.  `ItemService` mapuje listę encji `Item` na listę DTO `ItemWithListNameResponse`.
9.  Kontroler otrzymuje listę DTO i zwraca ją w odpowiedzi HTTP z kodem statusu 200 OK.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Endpoint musi być chroniony i dostępny tylko dla uwierzytelnionych użytkowników. Konfiguracja Spring Security musi obejmować ten endpoint.
- **Autoryzacja**: Kluczowym elementem jest weryfikacja, czy zalogowany użytkownik ma prawo dostępu do listy o podanym `listId`. Należy zaimplementować logikę sprawdzającą, czy użytkownik jest właścicielem listy (`shopping_lists.owner_id`) lub czy istnieje odpowiedni wpis w tabeli `shopping_list_shares` dla tego użytkownika i listy. Zapobiegnie to atakom typu IDOR.

## 7. Obsługa błędów
- **200 OK**: Pomyślnie pobrano listę produktów.
- **400 Bad Request**: `listId` w ścieżce jest nieprawidłowego typu (np. tekst zamiast liczby). Obsługiwane domyślnie przez Spring.
- **401 Unauthorized**: Użytkownik nie dostarczył tokenu JWT lub token jest nieważny. Obsługiwane przez Spring Security.
- **404 Not Found**: Rzucany, gdy lista o podanym `listId` nie istnieje lub użytkownik nie ma do niej uprawnień.
- **500 Internal Server Error**: Wystąpił nieoczekiwany błąd po stronie serwera. `GlobalExceptionHandler` powinien przechwycić wyjątek, zalogować go (używając SLF4J) i zwrócić odpowiedź w standardowym formacie.

## 8. Rozważania dotyczące wydajności
- **Problem N+1**: Aby uniknąć problemu N+1 podczas pobierania nazwy listy dla każdego produktu, należy użyć zapytania z jawnym `JOIN FETCH` w `ItemRepository` lub projekcji DTO (zgodnie z `.clinerules/spring-jpa.md`). Projekcja DTO jest w tym przypadku preferowana, ponieważ zapytanie będzie pobierać tylko niezbędne dane.
- **Paginacja**: Chociaż specyfikacja tego nie wymaga, w przypadku list z bardzo dużą liczbą produktów warto rozważyć dodanie paginacji w przyszłości.

## 9. Etapy wdrożenia
1.  **Utworzenie DTO**: Dodać `ItemWithListNameResponse` jako wewnętrzny `record` w pliku `apps/Backend/src/main/java/org/example/yourlist/domain/item/dto/ItemDto.java`.
2.  **Aktualizacja Repozytorium**: W interfejsie `ItemRepository` dodać nową metodę, która pobierze produkty wraz z nazwą listy, używając projekcji DTO.
    ```java
    // w ItemRepository.java
    @Query("SELECT new org.example.yourlist.domain.item.dto.ItemDto$ItemWithListNameResponse(i.id, sl.id, sl.name, i.name, i.description, i.isBought, i.createdAt) FROM Item i JOIN i.shoppingList sl WHERE sl.id = :listId")
    List<ItemDto.ItemWithListNameResponse> findAllWithListNameByShoppingListId(@Param("listId") Long listId);
    ```
3.  **Implementacja logiki w Serwisie**:
    - W `ItemService` stworzyć publiczną metodę `findAllItemsByListId(Long listId)`.
    - Wewnątrz tej metody, najpierw wywołać istniejącą (lub stworzyć nową) metodę w `ShoppingListService`, np. `checkAccess(Long listId)`, która zweryfikuje istnienie listy i uprawnienia użytkownika.
    - Jeśli dostęp jest autoryzowany, wywołać nową metodę z `ItemRepository` (`findAllWithListNameByShoppingListId`).
    - Zwrócić listę DTO.
4.  **Stworzenie metody w Kontrolerze**:
    - W `ItemController` (lub `ShoppingListController`) dodać metodę obsługującą żądanie `GET /api/lists/{listId}/items`.
    - Adnotacje: `@GetMapping("/{listId}/items")`, `@ResponseStatus(HttpStatus.OK)`.
    - Metoda powinna przyjmować `@PathVariable Long listId`.
    - Wywołać metodę serwisową `itemService.findAllItemsByListId(listId)`.
    - Zwrócić wynik.
5.  **Aktualizacja Konfiguracji Bezpieczeństwa**: Upewnić się w `SecurityConfiguration`, że ścieżka `/api/lists/{listId}/items` jest chroniona i wymaga uwierzytelnienia.
6.  **Napisanie Testów**:
    - **Testy jednostkowe** dla `ItemService`, mockując `ShoppingListService` i `ItemRepository`, aby sprawdzić logikę biznesową.
