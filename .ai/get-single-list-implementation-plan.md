# API Endpoint Implementation Plan: Get Single List

## 1. Przegląd punktu końcowego
Celem tego punktu końcowego jest umożliwienie uwierzytelnionym użytkownikom pobierania szczegółowych informacji o konkretnej liście zakupów na podstawie jej unikalnego identyfikatora. Użytkownik musi być właścicielem listy lub mieć do niej dostęp jako współpracownik, aby pomyślnie pobrać dane.

## 2. Szczegóły żądania
- **Metoda HTTP:** `GET`
- **Struktura URL:** `/api/lists/{id}`
- **Parametry:**
  - **Wymagane:**
    - `id` (zmienna w ścieżce): `Long` - Unikalny identyfikator listy zakupów.
    - `Authorization` (nagłówek): `String` - Token uwierzytelniający Bearer JWT.
  - **Opcjonalne:** Brak.
- **Request Body:** Brak.

## 3. Wykorzystywane typy
- **DTO Odpowiedzi:** `org.example.yourlist.domain.list.dto.ShoppingListDto.ShoppingListResponse`
  ```java
  public record ShoppingListResponse(
      Long id,
      String name,
      Long ownerId,
      boolean isOwner,
      UUID shareToken,
      LocalDateTime createdAt,
      LocalDateTime updatedAt
  ) {}
  ```

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (200 OK):**
  - **Content-Type:** `application/json`
  - **Body:** Obiekt JSON zawierający szczegóły listy, zgodny z DTO `ShoppingListResponse`.
- **Odpowiedzi błędów:**
  - `401 Unauthorized`: W przypadku braku lub nieprawidłowego tokenu JWT.
  - `403 Forbidden`: Gdy użytkownik nie ma uprawnień do wyświetlenia listy.
  - `404 Not Found`: Gdy lista o podanym `id` nie istnieje.
  - `500 Internal Server Error`: W przypadku nieoczekiwanych błędów serwera.

## 5. Przepływ danych
1.  Żądanie `GET /api/lists/{id}` trafia do `ShoppingListController`.
2.  Spring Security z `JwtAuthenticationFilter` weryfikuje token JWT i ustala tożsamość użytkownika (`AuthenticationPrincipal`).
3.  Metoda kontrolera wywołuje metodę w `ShoppingListService`, przekazując `id` listy oraz obiekt zalogowanego użytkownika.
4.  `ShoppingListService` wywołuje metodę `findById` z `ShoppingListRepository` w celu pobrania encji `ShoppingList`.
5.  Jeśli encja nie zostanie znaleziona, serwis rzuca wyjątek `ResourceNotFoundException`.
6.  Serwis sprawdza, czy zalogowany użytkownik jest właścicielem listy lub czy istnieje odpowiedni wpis w tabeli `shopping_list_shares`.
7.  Jeśli użytkownik nie ma uprawnień, serwis rzuca wyjątek `ForbiddenException`.
8.  Jeśli uprawnienia są poprawne, `ShoppingListMapper` mapuje encję `ShoppingList` na DTO `ShoppingListResponse`. Flaga `isOwner` jest ustawiana na podstawie porównania ID użytkownika z ID właściciela listy.
9.  `ShoppingListController` zwraca DTO z kodem statusu `200 OK`.
10. `GlobalExceptionHandler` przechwytuje wyjątki (`ResourceNotFoundException`, `ForbiddenException`) i mapuje je na odpowiednie kody statusu HTTP (404, 403).

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie:** Punkt końcowy musi być zabezpieczony. Dostęp do niego powinien być możliwy tylko dla uwierzytelnionych użytkowników. Konfiguracja Spring Security musi obejmować ten endpoint.
- **Autoryzacja:** Kluczowym elementem jest weryfikacja uprawnień w warstwie serwisowej. Należy bezwzględnie sprawdzić, czy użytkownik jest właścicielem zasobu lub czy zasób został mu udostępniony. Zapobiega to atakom typu IDOR (Insecure Direct Object Reference).

## 7. Rozważania dotyczące wydajności
- **Transakcje tylko do odczytu:** Operacja pobierania danych powinna być oznaczona adnotacją `@Transactional(readOnly = true)` w warstwie serwisu. Zwiększa to wydajność poprzez optymalizacje na poziomie JPA i bazy danych.
- **Unikanie problemu N+1:** Encja `ShoppingList` ma relację z `User` (właściciel). Należy upewnić się, że dane właściciela są pobierane za pomocą `JOIN FETCH` w zapytaniu repozytorium, aby uniknąć dodatkowych zapytań do bazy danych.

## 8. Etapy wdrożenia
1.  **Aktualizacja Repozytorium (`ShoppingListRepository`):**
    -   Dodać metodę, która pobierze `ShoppingList` wraz z jej właścicielem, aby uniknąć problemu N+1.
    ```java
    @Query("SELECT sl FROM ShoppingList sl JOIN FETCH sl.owner WHERE sl.id = :id")
    Optional<ShoppingList> findByIdWithOwner(@Param("id") Long id);
    ```

2.  **Implementacja logiki w Serwisie (`ShoppingListService`):**
    -   Utworzyć publiczną metodę `getShoppingListDetails(Long listId, User currentUser)`.
    -   Wewnątrz metody:
        -   Wywołać `shoppingListRepository.findByIdWithOwner(listId)`. W przypadku braku wyniku, rzucić `ResourceNotFoundException`.
        -   Sprawdzić uprawnienia: `list.getOwner().getId().equals(currentUser.getId())` lub sprawdzić w `ShoppingListShareRepository`. Jeśli brak uprawnień, rzucić `ForbiddenException`.
        -   Zmapować encję na `ShoppingListDto.ShoppingListResponse` za pomocą `ShoppingListMapper`.

3.  **Implementacja metody w Kontrolerze (`ShoppingListController`):**
    -   Utworzyć metodę obsługującą żądanie `GET /api/lists/{id}`.
    -   Użyć adnotacji `@GetMapping("/{id}")`.
    -   Wstrzyknąć zalogowanego użytkownika za pomocą `@AuthenticationPrincipal User currentUser`.
    -   Wywołać metodę z `ShoppingListService` i zwrócić wynik.
    -   Użyć adnotacji `@ResponseStatus(HttpStatus.OK)` zgodnie z dobrymi praktykami.
    ```java
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ShoppingListDto.ShoppingListResponse getList(
        @PathVariable Long id,
        @AuthenticationPrincipal User currentUser
    ) {
        return shoppingListService.getShoppingListDetails(id, currentUser);
    }
    ```

4.  **Aktualizacja Mappera (`ShoppingListMapper`):**
    -   Upewnić się, że istnieje metoda mapująca `ShoppingList` (encja) na `ShoppingListResponse` (DTO).
    -   Dodać logikę ustawiania pola `isOwner` na podstawie przekazanego aktualnego użytkownika.
    ```java
    @Mapping(target = "ownerId", source = "entity.owner.id")
    @Mapping(target = "isOwner", expression = "java(entity.getOwner().getId().equals(currentUser.getId()))")
    ShoppingListResponse toDto(ShoppingList entity, User currentUser);
    ```

5.  **Dodanie testów jednostkowych (`ShoppingListServiceTest`):**
    -   Napisać testy sprawdzające:
        -   Pomyślne pobranie listy przez właściciela.
        -   Pomyślne pobranie listy przez współpracownika (jeśli dotyczy).
        -   Rzucenie `ResourceNotFoundException`, gdy lista nie istnieje.
        -   Rzucenie `ForbiddenException`, gdy użytkownik nie ma uprawnień.
