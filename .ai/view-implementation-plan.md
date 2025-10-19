# API Endpoint Implementation Plan: Create List

## 1. Przegląd punktu końcowego
Celem tego punktu końcowego jest umożliwienie uwierzytelnionym użytkownikom tworzenia nowych list zakupów. Punkt końcowy przyjmuje nazwę listy, waliduje ją, tworzy nowy rekord w bazie danych i zwraca szczegóły nowo utworzonej listy.

## 2. Szczegóły żądania
- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/lists`
- **Nagłówki**:
  - `Authorization`: `Bearer {token}` (Wymagany)
  - `Content-Type`: `application/json`
- **Ciało żądania**:
```json
{
  "name": "Weekly Groceries"
}
```
- **Walidacja parametrów**:
  - `name`: Wymagany, `String`, maksymalna długość 255 znaków.

## 3. Wykorzystywane typy
- **Request DTO**: `org.example.yourlist.domain.list.dto.ListDto.CreateListRequest`
- **Response DTO**: `org.example.yourlist.domain.list.dto.ListDto.ListResponse`
- **Encja**: `org.example.yourlist.domain.list.entity.List`

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (201 Created)**:
```json
{
  "id": 1,
  "name": "Weekly Groceries",
  "ownerId": 1,
  "isOwner": true,
  "shareToken": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-01-18T15:00:00Z",
  "updatedAt": "2025-01-18T15:00:00Z"
}
```
- **Odpowiedzi błędów**:
  - `400 Bad Request`: Nieprawidłowe dane wejściowe (np. brak `name`).
  - `401 Unauthorized`: Brak lub nieprawidłowy token uwierzytelniający.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera.

## 5. Przepływ danych
1.  Użytkownik wysyła żądanie `POST` na adres `/api/lists` z tokenem JWT i ciałem żądania.
2.  Warstwa Spring Security weryfikuje token JWT i uwierzytelnia użytkownika.
3.  Żądanie trafia do metody w `ListController`.
4.  Mechanizm Bean Validation, uruchamiany przez adnotację `@Valid`, sprawdza poprawność DTO `CreateListRequest`.
5.  `ListController` wywołuje metodę `createList` w `ListService`, przekazując DTO żądania oraz dane uwierzytelnionego użytkownika (np. obiekt `User` uzyskany przez `@AuthenticationPrincipal`).
6.  `ListService` tworzy nową instancję encji `List`, ustawiając `name` z DTO i `owner` na podstawie zalogowanego użytkownika.
7.  `ListService` używa `ListRepository` (rozszerzającego `JpaRepository`) do zapisania nowej encji w bazie danych.
8.  Transakcja bazodanowa zostaje zatwierdzona.
9.  `ListService` mapuje zapisaną encję `List` na DTO `ListResponse`. Pole `isOwner` jest ustawiane na `true`.
10. `ListController` zwraca odpowiedź `201 Created` z DTO `ListResponse` w ciele.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Punkt końcowy musi być chroniony i dostępny tylko dla ról `USER` lub `ADMIN`. Należy to skonfigurować w `SecurityFilterChain`.
- **Autoryzacja**: Identyfikator właściciela (`ownerId`) musi być pobierany z kontekstu bezpieczeństwa (tokenu JWT), a nie z ciała żądania, aby uniemożliwić tworzenie list w imieniu innych użytkowników.
- **Walidacja danych**: Należy rygorystycznie walidować pole `name`, aby zapobiec atakom typu SQL Injection (choć JPA w dużej mierze chroni przed tym) oraz zapewnić integralność danych.

## 7. Obsługa błędów
- **Błędy walidacji (400)**: Obsługiwane centralnie przez `@ControllerAdvice`. W przypadku `MethodArgumentNotValidException`, zwracany jest JSON z informacjami o błędach walidacji. Błędy te powinny być logowane na poziomie `WARN` przy użyciu SLF4J.
- **Brak uwierzytelnienia (401)**: Obsługiwane przez Spring Security.
- **Błędy serwera (500)**: Wszelkie nieprzechwycone wyjątki (np. `DataAccessException`) będą obsługiwane przez `@ControllerAdvice`, który zwróci generyczną odpowiedź błędu i zaloguje wyjątek na poziomie `ERROR`.

## 8. Rozważania dotyczące wydajności
- Operacja tworzenia listy jest operacją zapisu, która powinna być szybka.
- Transakcja bazodanowa powinna być jak najkrótsza, co jest zgodne z wytycznymi `SPRING_DATA_JPA` (`@Transactional` na poziomie metody serwisowej).
- Nie przewiduje się problemów z wydajnością dla tego punktu końcowego, ponieważ nie wykonuje on złożonych zapytań ani operacji.

## 9. Etapy wdrożenia
1.  **Kontroler**:
    -   Utworzyć nową metodę w `ListController` obsługującą `POST /api/lists`.
    -   Metoda powinna przyjmować `@Valid @RequestBody CreateListRequest` oraz obiekt użytkownika przez `@AuthenticationPrincipal`.
    -   Zabezpieczyć metodę adnotacją `@PostMapping`.
    -   Wywołać odpowiednią metodę w `ListService`.
    -   Zwrócić `ResponseEntity.status(HttpStatus.CREATED).body(...)`.
2.  **Serwis**:
    -   Utworzyć metodę `createList(CreateListRequest dto, User currentUser)` w `ListService`.
    -   Oznaczyć metodę adnotacją `@Transactional`.
    -   Zaimplementować logikę tworzenia encji `List`, ustawiania jej pól (`name`, `owner`) i zapisywania jej za pomocą `ListRepository`.
    -   Dodać logikę mapowania encji na `ListResponse` DTO.
3.  **Repozytorium**:
    -   Upewnić się, że istnieje `ListRepository` rozszerzający `JpaRepository<List, Long>`.
4.  **Mapowanie**:
    -   Zaimplementować lub zaktualizować mapper (np. MapStruct lub ręczny), aby obsługiwał konwersję z encji `List` do `ListResponse`.
5.  **Testy**:
    -   Napisać testy jednostkowe dla `ListService`, weryfikujące logikę biznesową.
    -   Napisać testy integracyjne dla `ListController`, które sprawdzają:
        -   Pomyślne utworzenie listy (status 201).
        -   Odrzucenie żądania z nieprawidłowymi danymi (status 400).
        -   Odrzucenie żądania bez tokenu uwierzytelniającego (status 401).
