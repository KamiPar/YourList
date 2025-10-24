# API Endpoint Implementation Plan: Delete Item

## 1. Przegląd punktu końcowego
Ten punkt końcowy jest odpowiedzialny za usunięcie określonego przedmiotu (`item`) z określonej listy zakupów (`shopping_list`). Operacja jest idempotentna. Pomyślne usunięcie nie zwraca żadnej treści.

## 2. Szczegóły żądania
- **Metoda HTTP**: `DELETE`
- **Struktura URL**: `/api/lists/{listId}/items/{itemId}`
- **Parametry**:
  - **Wymagane**:
    - `listId` (parametr ścieżki): Identyfikator (`BIGINT`) listy zakupów.
    - `itemId` (parametr ścieżki): Identyfikator (`BIGINT`) przedmiotu do usunięcia.
    - `Authorization` (nagłówek): Token Bearer JWT do uwierzytelniania użytkownika.
  - **Opcjonalne**: Brak
- **Request Body**: Brak

## 3. Wykorzystywane typy
- **DTOs**: Nie są wymagane żadne DTO dla żądania ani odpowiedzi.
- **Modele**: Nie są wymagane żadne modele poleceń.

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu**:
  - **Kod stanu**: `204 No Content`
  - **Treść**: Brak
- **Odpowiedzi błędów**:
  - **Kod stanu**: `401 Unauthorized` (Brak lub nieprawidłowy token JWT)
  - **Kod stanu**: `403 Forbidden` (Użytkownik nie ma uprawnień do modyfikacji tej listy)
  - **Kod stanu**: `404 Not Found` (Lista lub przedmiot nie istnieje)
  - **Kod stanu**: `500 Internal Server Error` (Błędy serwera)

## 5. Przepływ danych
1.  Żądanie `DELETE` trafia do `ItemController`.
2.  Filtr `JwtAuthenticationFilter` weryfikuje token JWT i ustawia kontekst bezpieczeństwa.
3.  Metoda kontrolera wywołuje metodę w `ItemService`, przekazując `listId`, `itemId` oraz uwierzytelnionego użytkownika (`Principal`).
4.  `ItemService` najpierw sprawdza, czy użytkownik ma uprawnienia dostępu do listy (jest właścicielem lub współpracownikiem).
5.  Następnie serwis weryfikuje, czy przedmiot o podanym `itemId` istnieje i należy do listy o podanym `listId`.
6.  Jeśli obie weryfikacje przejdą pomyślnie, `ItemService` wywołuje metodę `delete` na `ItemRepository`.
7.  Transakcja bazodanowa jest zatwierdzana.
8.  Kontroler zwraca odpowiedź `204 No Content`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Punkt końcowy musi być zabezpieczony. Dostęp jest dozwolony tylko dla uwierzytelnionych użytkowników z ważnym tokenem JWT.
- **Autoryzacja**: Należy sprawdzić, czy uwierzytelniony użytkownik jest właścicielem listy (`shopping_lists.owner_id`) lub czy istnieje odpowiedni wpis w tabeli `shopping_list_shares` dla tego użytkownika i listy. Zapobiega to nieautoryzowanemu usuwaniu przedmiotów z cudzych list (IDOR).
- **Walidacja danych wejściowych**: Parametry ścieżki (`listId`, `itemId`) są automatycznie walidowane przez Spring Framework pod kątem zgodności z typem `Long`.

## 7. Obsługa błędów
Błędy będą centralnie zarządzane przez `GlobalExceptionHandler` i logowane przy użyciu SLF4J.
- **`ResourceNotFoundException`**: Rzucany, gdy lista (`listId`) lub przedmiot (`itemId`) nie zostaną znalezione w bazie danych. Skutkuje odpowiedzią `404 Not Found`.
- **`ForbiddenException`**: Rzucany, gdy użytkownik próbuje usunąć przedmiot z listy, do której nie ma uprawnień. Skutkuje odpowiedzią `403 Forbidden`.
- **Brak tokenu/Nieprawidłowy token**: Obsługiwane przez Spring Security. Skutkuje odpowiedzią `401 Unauthorized`.
- **Inne wyjątki (np. `DataAccessException`)**: Obsługiwane jako błędy ogólne. Skutkują odpowiedzią `500 Internal Server Error`.

## 8. Rozważania dotyczące wydajności
- Operacja usunięcia jest prosta i opiera się na kluczach głównych, więc powinna być bardzo wydajna.
- Sprawdzenie uprawnień może wymagać dodatkowego zapytania do bazy danych (sprawdzenie `shopping_list_shares`), ale przy prawidłowym indeksowaniu nie powinno to stanowić problemu.
- Transakcja powinna być krótka, obejmując tylko operację usunięcia, zgodnie z wytycznymi `SPRING_DATA_JPA`.

## 9. Etapy wdrożenia
1.  **Kontroler (`ItemController`)**:
    -   Dodać nową metodę obsługującą żądania `DELETE` na ścieżce `/api/lists/{listId}/items/{itemId}`.
    -   Użyć adnotacji `@DeleteMapping("/{itemId}")` w ramach kontrolera zmapowanego na `/api/lists/{listId}/items`.
    -   Wstrzyknąć `listId` i `itemId` jako `@PathVariable`.
    -   Zabezpieczyć metodę, aby wymagała uwierzytelnienia.
    -   Wywołać odpowiednią metodę w `ItemService`.
    -   Użyć adnotacji `@ResponseStatus(HttpStatus.NO_CONTENT)` w celu zwrócenia prawidłowego kodu stanu w przypadku sukcesu.

2.  **Serwis (`ItemService`)**:
    -   Utworzyć nową metodę publiczną, np. `deleteItem(Long listId, Long itemId, User principal)`.
    -   Zaimplementować logikę weryfikacji uprawnień: sprawdzić, czy `principal` jest właścicielem listy lub ma do niej dostęp poprzez współdzielenie. Jeśli nie, rzucić `ForbiddenException`.
    -   Pobrać przedmiot z `ItemRepository` za pomocą `listId` i `itemId`. Jeśli nie istnieje, rzucić `ResourceNotFoundException`.
    -   Wywołać `itemRepository.delete(item)`.
    -   Oznaczyć metodę adnotacją `@Transactional`.

3.  **Repozytorium (`ItemRepository`)**:
    -   Upewnić się, że istnieje metoda do wyszukiwania przedmiotu na podstawie `id` i `shopping_list_id`, np. `findByIdAndShoppingListId(Long itemId, Long listId)`. Jeśli nie, należy ją dodać.

4.  **Testy**:
    -   Napisać testy jednostkowe dla `ItemService`, obejmujące:
        -   Pomyślne usunięcie przedmiotu przez właściciela.
        -   Pomyślne usunięcie przedmiotu przez współpracownika.
        -   Próbę usunięcia przez nieautoryzowanego użytkownika (`ForbiddenException`).
        -   Próbę usunięcia nieistniejącego przedmiotu (`ResourceNotFoundException`).
        -   Próbę usunięcia przedmiotu z nieistniejącej listy.
    -   Napisać testy integracyjne dla `ItemController`, które symulują rzeczywiste żądania HTTP i weryfikują kody stanu odpowiedzi.
