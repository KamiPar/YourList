# Plan implementacji widoku: Widok Szczegółów Listy

## 1. Przegląd
Widok Szczegółów Listy (`/lists/{id}`) jest centralnym miejscem do zarządzania produktami na konkretnej liście zakupów. Umożliwia użytkownikom dodawanie nowych produktów, oznaczanie ich jako kupione, edycję oraz usuwanie. Widok ten musi obsługiwać optymistyczne aktualizacje i synchronizację w czasie rzeczywistym, aby zapewnić płynną współpracę między użytkownikami współdzielącymi listę.

## 2. Routing widoku
Widok będzie dostępny pod dynamiczną ścieżką routingu, która zawiera identyfikator listy.

- **Ścieżka:** `/lists/:id`
- **Przykład:** `/lists/123`

## 3. Struktura komponentów
Hierarchia komponentów została zaprojektowana w celu oddzielenia odpowiedzialności, gdzie komponent-kontener (`ListDetailsViewComponent`) zarządza stanem i logiką, a komponenty-prezentacyjne (dumb components) są odpowiedzialne wyłącznie za renderowanie UI i emitowanie zdarzeń.

```
ListDetailsViewComponent (Smart Component)
├── ListHeaderComponent
├── AddItemFormComponent
├── ProductListComponent
│   ├── ProductItemComponent (dla każdego produktu z sekcji "do kupienia")
│   └── ProductItemComponent (dla każdego produktu z sekcji "kupione")
└── EmptyStateComponent (wyświetlany, gdy lista jest pusta)
```
Komponent `ShareBottomSheetComponent` będzie otwierany imperatywnie przez serwis `MatBottomSheet`.

## 4. Szczegóły komponentów

### `ListDetailsViewComponent`
- **Opis komponentu:** Główny komponent widoku, odpowiedzialny za pobieranie danych listy i produktów z API, zarządzanie stanem za pomocą sygnałów oraz koordynację wszystkich komponentów podrzędnych.
- **Główne elementy:** Wykorzystuje komponenty podrzędne do budowy całego interfejsu. Implementuje logikę warunkową do wyświetlania listy produktów lub komponentu `EmptyStateComponent`.
- **Obsługiwane interakcje:**
  - `handleItemAdded(item)`: Wywołuje serwis stanu w celu dodania nowego produktu.
  - `handleItemUpdated(item)`: Wywołuje serwis stanu w celu aktualizacji istniejącego produktu.
  - `handleItemDeleted(itemId)`: Wywołuje serwis stanu w celu usunięcia produktu.
  - `handleListNameUpdated(name)`: Wywołuje serwis stanu w celu aktualizacji nazwy listy.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `ListDetailsViewModel`, `ShoppingListResponse`, `ItemResponse[]`.
- **Propsy:** Brak (komponent routowalny, `listId` pobierane z `ActivatedRoute`).

### `ListHeaderComponent`
- **Opis komponentu:** Wyświetla nagłówek strony, w tym edytowalną nazwę listy oraz przyciski akcji ("Wróć", "Udostępnij").
- **Główne elementy:** `button` (Wróć), `h1` (nazwa listy, która po kliknięciu staje się `input`), `button` (Udostępnij).
- **Obsługiwane interakcje:**
  - `(backClicked)`: Emituje zdarzenie nawigacji wstecz.
  - `(shareClicked)`: Emituje zdarzenie otwarcia modala udostępniania.
  - `(listNameUpdated)`: Emituje nową nazwę listy po zakończeniu edycji.
- **Obsługiwana walidacja:** Nazwa listy nie może być pusta i nie może przekraczać 255 znaków.
- **Typy:** `string` (listName), `boolean` (isOwner).
- **Propsy:** `listName: string`, `isOwner: boolean`.

### `AddItemFormComponent`
- **Opis komponentu:** Formularz do dodawania nowego produktu do listy.
- **Główne elementy:** `form` z dwoma polami `input` (nazwa i opis) oraz `button` typu `submit`.
- **Obsługiwane interakcje:**
  - `(itemAdded)`: Emituje obiekt z danymi nowego produktu po poprawnym zwalidowaniu i wysłaniu formularza.
- **Obsługiwana walidacja:**
  - `name`: Pole wymagane, maksymalna długość 255 znaków.
  - `description`: Pole opcjonalne.
- **Typy:** `CreateItemRequest`.
- **Propsy:** Brak.

### `ProductListComponent`
- **Opis komponentu:** Renderuje dwie sekcje: "Do kupienia" i "Kupione", iterując po odpowiednich listach produktów i używając `ProductItemComponent` dla każdego z nich.
- **Główne elementy:** Dwa bloki `div` lub `section`, każdy z nagłówkiem (`h2`) i listą (`ul` lub `div`) komponentów `ProductItemComponent`.
- **Obsługiwane interakcje:** Przekazuje zdarzenia z `ProductItemComponent` w górę do `ListDetailsViewComponent`.
  - `(itemUpdated)`
  - `(itemDeleted)`
- **Obsługiwana walidacja:** Brak.
- **Typy:** `ProductItemViewModel[]`.
- **Propsy:** `itemsToBuy: ProductItemViewModel[]`, `boughtItems: ProductItemViewModel[]`.

### `ProductItemComponent`
- **Opis komponentu:** Reprezentuje pojedynczy produkt na liście. Umożliwia zmianę statusu "kupiony" oraz edycję nazwy i opisu w trybie "inline".
- **Główne elementy:** `mat-checkbox`, `span` dla nazwy i opisu (które zmieniają się w `input` podczas edycji), `button` do usuwania.
- **Obsługiwane interakcje:**
  - `(statusChanged)`: Emituje nowy status `isBought`.
  - `(nameChanged)`: Emituje zaktualizowaną nazwę.
  - `(descriptionChanged)`: Emituje zaktualizowany opis.
  - `(deleteClicked)`: Emituje zdarzenie usunięcia.
- **Obsługiwana walidacja:** Nazwa produktu nie może być pusta.
- **Typy:** `ProductItemViewModel`.
- **Propsy:** `item: ProductItemViewModel`.

## 5. Typy
Do implementacji widoku wymagane będą istniejące typy DTO z API oraz dedykowane modele widoku (ViewModel) do zarządzania stanem UI.

- **DTO (Data Transfer Objects):**
  - `ShoppingListResponse`: Dane dotyczące listy.
  - `ItemResponse`: Dane dotyczące produktu.
  - `CreateItemRequest`: Obiekt do tworzenia nowego produktu.
  - `UpdateItemRequest`: Obiekt do aktualizacji produktu.

- **ViewModel (Modele Widoku):**
  - **`ProductItemViewModel`**: Reprezentuje produkt w UI.
    ```typescript
    interface ProductItemViewModel {
      id: number;
      name: string;
      description?: string;
      isBought: boolean;
      isEditingName: boolean; // Stan UI
      isEditingDescription: boolean; // Stan UI
      isOptimistic?: boolean; // Flaga dla optymistycznej aktualizacji
    }
    ```
  - **`ListDetailsViewModel`**: Agreguje cały stan potrzebny do wyrenderowania widoku.
    ```typescript
    interface ListDetailsViewModel {
      listInfo: {
        id: number;
        name: string;
        isOwner: boolean;
        shareToken: string;
      };
      itemsToBuy: ProductItemViewModel[];
      boughtItems: ProductItemViewModel[];
      isLoading: boolean;
      error?: string;
      isEmpty: boolean; // Obliczane na podstawie list produktów
    }
    ```

## 6. Zarządzanie stanem
Zgodnie z wytycznymi technologicznymi, stan będzie zarządzany przy użyciu **Angular Signals**. Zostanie stworzony dedykowany serwis lub funkcja kompozycyjna (`composable function`), która zamknie w sobie całą logikę stanu.

- **`ListDetailsStateService`**:
  - **Sygnały stanu (State Signals):**
    - `list = signal<ShoppingListResponse | null>(null)`
    - `items = signal<ItemResponse[]>([])`
    - `isLoading = signal<boolean>(true)`
    - `error = signal<string | null>(null)`
  - **Sygnały pochodne (Computed Signals):**
    - `itemsToBuy = computed(() => items().filter(item => !item.isBought))`
    - `boughtItems = computed(() => items().filter(item => item.isBought))`
    - `viewModel = computed<ListDetailsViewModel>(() => ...)`: Główny ViewModel dla komponentu.
  - **Metody (Akcje):**
    - `fetchData(listId)`: Pobiera dane listy i produktów.
    - `addItem(item)`: Implementuje logikę optymistycznego dodania produktu.
    - `updateItem(itemId, data)`: Implementuje logikę optymistycznej aktualizacji.
    - `deleteItem(itemId)`: Implementuje logikę optymistycznego usunięcia.

## 7. Integracja API
Integracja z backendem będzie realizowana za pomocą wygenerowanych serwisów `ItemControllerRestService` i `ShoppingListControllerRestService`.

- **Pobieranie danych:**
  - `GET /api/lists/{listId}` -> `ShoppingListControllerRestService.getList(listId)`
  - `GET /api/lists/{listId}/items` -> `ItemControllerRestService.getAllItemsForList(listId)`
- **Tworzenie produktu:**
  - `POST /api/lists/{listId}/items`
  - **Request:** `CreateItemRequest`
  - **Response:** `ItemResponse`
- **Aktualizacja produktu:**
  - `PATCH /api/lists/{listId}/items/{itemId}`
  - **Request:** `UpdateItemRequest`
  - **Response:** `ItemResponse`
- **Usuwanie produktu:**
  - `DELETE /api/lists/{listId}/items/{itemId}`
  - **Response:** `204 No Content`

## 8. Interakcje użytkownika
- **Dodanie produktu:** Użytkownik wypełnia formularz i klika "Dodaj". Produkt natychmiast pojawia się na liście "do kupienia" (optymistyczna aktualizacja), a w tle wysyłane jest żądanie `POST`.
- **Oznaczenie jako kupiony:** Użytkownik klika checkbox. Produkt natychmiast zmienia styl i przenosi się do sekcji "kupione" (optymistyczna aktualizacja). W tle wysyłane jest żądanie `PATCH` z `isBought: true`.
- **Edycja nazwy produktu:** Użytkownik klika na nazwę, która zamienia się w pole `input`. Po zakończeniu edycji (blur/enter) nazwa jest optymistycznie aktualizowana, a w tle wysyłane jest żądanie `PATCH`.
- **Udostępnianie listy:** Kliknięcie przycisku "Udostępnij" otwiera `BottomSheet` z linkiem do skopiowania.

## 9. Warunki i walidacja
- **Formularz dodawania produktu (`AddItemFormComponent`):**
  - Pole `name` jest wymagane. Przycisk "Dodaj" jest nieaktywny, jeśli pole jest puste.
  - Walidacja `maxlength="255"` na polach tekstowych.
- **Edycja "inline" (`ProductItemComponent`, `ListHeaderComponent`):**
  - Zapisanie pustej nazwy listy lub produktu jest blokowane. Zmiana jest odrzucana lub przycisk zapisu jest nieaktywny.

## 10. Obsługa błędów
- **Błędy sieciowe / tryb offline:** Aplikacja powinna działać w trybie offline. Zmiany (dodanie, edycja, usunięcie) powinny być kolejkowane i synchronizowane po odzyskaniu połączenia. Optymistycznie zaktualizowane elementy UI powinny mieć dyskretny wskaźnik "oczekuje na synchronizację".
- **Błędy serwera (4xx/5xx):**
  - **401/403:** Globalny interceptor powinien przechwycić błąd i przekierować użytkownika na stronę logowania.
  - **404 (Lista nie istnieje):** Widok powinien wyświetlić komunikat "Nie znaleziono listy" zamiast interfejsu zarządzania.
  - **400 (Błąd walidacji):** Optymistyczna zmiana w UI jest cofana, a użytkownikowi wyświetlany jest komunikat błędu, np. za pomocą `MatSnackBar` lub bezpośrednio przy polu formularza.

## 11. Kroki implementacji
1.  **Struktura i routing:** Utworzenie nowego, routowalnego, samodzielnego komponentu `ListDetailsViewComponent` pod ścieżką `/lists/:id`.
2.  **Serwis stanu:** Stworzenie serwisu `ListDetailsStateService` z podstawowymi sygnałami (`list`, `items`, `isLoading`, `error`) i metodą do pobierania danych z API.
3.  **Komponenty UI:** Utworzenie szkieletów wszystkich komponentów podrzędnych (`ListHeader`, `AddItemForm`, `ProductList`, `ProductItem`) z odpowiednimi propsami (`@Input`) i zdarzeniami (`@Output`).
4.  **Połączenie komponentów:** Złożenie `ListDetailsViewComponent` z komponentów podrzędnych, przekazując im dane z `viewModel` i nasłuchując na ich zdarzenia.
5.  **Implementacja akcji (CRUD):**
    - Zaimplementowanie metody `addItem` w serwisie stanu, włączając w to logikę optymistycznej aktualizacji i obsługę wywołania API. Połączenie jej z `AddItemFormComponent`.
    - Zaimplementowanie metody `updateItem` dla zmiany statusu `isBought` oraz edycji inline.
    - Zaimplementowanie metody `deleteItem`.
6.  **Obsługa stanu ładowania i błędów:** Wyświetlanie wskaźników ładowania (np. skeleton loader) na podstawie sygnału `isLoading` oraz komunikatów o błędach na podstawie sygnału `error`.
7.  **Implementacja "Empty State":** Dodanie logiki warunkowej do wyświetlania `EmptyStateComponent`, gdy lista produktów jest pusta.
8.  **Funkcjonalność udostępniania:** Implementacja `ShareBottomSheetComponent` i logiki jego otwierania.
9.  **Polling (symulacja real-time):** Dodanie w serwisie stanu mechanizmu `setInterval` do okresowego odświeżania danych o produktach jako tymczasowe rozwiązanie dla synchronizacji.
10. **Styling i Dostępność:** Ostylowanie wszystkich komponentów za pomocą TailwindCSS zgodnie z projektem UI. Zapewnienie, że wszystkie interaktywne elementy mają odpowiedni rozmiar (`min. 44x44px`).
11. **Testy:** Napisanie testów jednostkowych dla serwisu stanu i komponentów.
