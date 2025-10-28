# Plan implementacji widoku "Moje Listy"

## 1. Przegląd
Widok "Moje Listy" jest głównym ekranem dla zalogowanego użytkownika, którego celem jest wyświetlenie wszystkich jego list zakupów – zarówno tych, których jest właścicielem, jak i tych, które zostały mu udostępnione. Widok umożliwia również tworzenie nowych list oraz nawigację do szczegółów wybranej listy. Implementacja będzie kładła nacisk na reaktywność interfejsu, obsługę stanów ładowania, pustego oraz błędów.

## 2. Routing widoku
Widok będzie dostępny pod następującą ścieżką w systemie routingu aplikacji:
- **Ścieżka:** `/lists`
- **Ochrona:** Dostęp do tej ścieżki musi być chroniony przez Guard, który weryfikuje, czy użytkownik jest zalogowany.

## 3. Struktura komponentów
Hierarchia komponentów dla tego widoku będzie zorganizowana w następujący sposób, z wykorzystaniem komponentów typu "smart" (zarządzających stanem) i "dumb" (prezentacyjnych).

```
ListsViewComponent (Komponent routowalny, smart)
│
├── @if (isLoading)
│   └── SkeletonLoaderComponent (dumb)
│
├── @if (isEmpty)
│   └── EmptyStateComponent (dumb)
│
├── @if (hasLists)
│   └── @for (list of lists)
│       └── ShoppingListItemComponent (dumb)
│
└── FloatingActionButton (przycisk, np. z Angular Material)
```
- Komponent `CreateListModalComponent` będzie otwierany imperatywnie za pomocą serwisu dialogów (np. `MatDialog` z Angular Material).

## 4. Szczegóły komponentów

### ListsViewComponent
- **Opis komponentu:** Główny, routowalny komponent widoku. Odpowiada za komunikację z API, zarządzanie stanem (listy, status ładowania, błędy) za pomocą sygnałów (Signals) oraz renderowanie odpowiednich komponentów podrzędnych w zależności od stanu.
- **Główne elementy:** Logika do obsługi stanów `loading`, `empty`, `error` i `loaded` z listą danych. Wykorzystuje wbudowany blok `@if` i `@for` do warunkowego renderowania. Zawiera pływający przycisk akcji (FAB) do otwierania modala tworzenia listy.
- **Obsługiwane interakcje:**
  - Otwarcie modala tworzenia nowej listy po kliknięciu FAB.
  - Obsługa zdarzenia nawigacji do szczegółów listy, emitowanego przez `ShoppingListItemComponent`.
  - Obsługa zdarzenia usunięcia listy, emitowanego przez `ShoppingListItemComponent` (wraz z otwarciem modala potwierdzającego).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `ShoppingListSummaryResponse`, `Pageable`, `ShoppingListSummaryVm`.
- **Propsy:** Brak (komponent routowalny).

### ShoppingListItemComponent
- **Opis komponentu:** Komponent prezentacyjny (dumb) w formie karty, wyświetlający podsumowanie pojedynczej listy zakupów.
- **Główne elementy:** Elementy HTML stylowane za pomocą TailwindCSS do wyświetlania nazwy listy, liczby produktów, daty ostatniej modyfikacji. Zawiera ikonę oznaczającą listę udostępnioną oraz przycisk "Usuń" (widoczny warunkowo). Cały komponent jest klikalny w celu nawigacji.
- **Obsługiwane interakcje:**
  - `(navigate)`: Emituje zdarzenie z `id` listy po kliknięciu karty.
  - `(delete)`: Emituje zdarzenie z `id` listy po kliknięciu przycisku "Usuń".
- **Obsługiwana walidacja:** Brak.
- **Typy:** `ShoppingListSummaryVm`.
- **Propsy:**
  - `list: InputSignal<ShoppingListSummaryVm>`: Obiekt z danymi listy do wyświetlenia.

### CreateListModalComponent
- **Opis komponentu:** Komponent modalny zawierający formularz do tworzenia nowej listy zakupów.
- **Główne elementy:** Formularz (`<form>`) z jednym polem tekstowym (`<input type="text">`) na nazwę listy, etykietą, miejscem na komunikat walidacyjny oraz przyciskami "Anuluj" i "Utwórz".
- **Obsługiwane interakcje:**
  - Wprowadzanie tekstu w polu nazwy.
  - Przesłanie formularza w celu utworzenia listy.
- **Obsługiwana walidacja:**
  - Nazwa listy jest wymagana (`Validators.required`).
  - Maksymalna długość nazwy to 255 znaków (`Validators.maxLength(255)`).
- **Typy:** `CreateShoppingListRequest`, `ShoppingListResponse`.
- **Propsy:** Brak (otwierany przez serwis). Zwraca dane nowo utworzonej listy po zamknięciu.

### Pozostałe komponenty (dumb)
- **EmptyStateComponent:** Wyświetla grafikę i tekst, gdy użytkownik nie ma żadnych list.
- **SkeletonLoaderComponent:** Wyświetla kilka animowanych placeholderów w kształcie kart `ShoppingListItemComponent` podczas ładowania danych.

## 5. Typy
Do implementacji widoku wymagane będą następujące typy danych.

### Typy DTO (zgodne z API)
- `ShoppingListSummaryResponse`: Obiekt reprezentujący podsumowanie listy, zwracany przez `GET /api/lists`.
- `CreateShoppingListRequest`: Obiekt wysyłany w ciele żądania `POST /api/lists`.
- `ShoppingListResponse`: Obiekt zwracany po pomyślnym utworzeniu listy.
- `Pageable`: Obiekt używany do definiowania parametrów paginacji dla `GET /api/lists`.

### Typy ViewModel (VM)
W celu oddzielenia logiki prezentacji od struktury API, zostanie stworzony dedykowany ViewModel.
- **`ShoppingListSummaryVm`**:
  ```typescript
  export interface ShoppingListSummaryVm {
    id: number;
    name: string;
    isOwner: boolean;
    // Sformatowana data do wyświetlenia, np. "2 godziny temu"
    lastModified: string;
    // Sformatowana etykieta, np. "5 produktów (2 kupione)"
    itemCountLabel: string;
    // Flagi do warunkowego renderowania w szablonie
    showDeleteButton: boolean;
    isShared: boolean;
  }
  ```

## 6. Zarządzanie stanem
Zarządzanie stanem będzie realizowane w `ListsViewComponent` z wykorzystaniem **Angular Signals**, zgodnie z przyjętymi standardami kodowania.

- **Główny sygnał stanu:**
  ```typescript
  state = signal<{
    lists: ShoppingListSummaryResponse[];
    status: 'loading' | 'loaded' | 'error';
    error: string | null;
  }>({
    lists: [],
    status: 'loading',
    error: null,
  });
  ```
- **Sygnały pochodne (computed signals):**
  ```typescript
  isLoading = computed(() => this.state().status === 'loading');
  isLoaded = computed(() => this.state().status === 'loaded');
  isEmpty = computed(() => this.isLoaded() && this.state().lists.length === 0);
  // Sygnał z listą przekształconą na ViewModel
  listsVm = computed(() => this.state().lists.map(list => this.mapToVm(list)));
  ```
- **Aktualizacje stanu:**
  - **Po utworzeniu listy:** Nowa lista zostanie dodana na początek tablicy `lists` w sygnale `state`.
  - **Po usunięciu listy:** Lista zostanie usunięta z tablicy `lists` za pomocą metody `filter`.

## 7. Integracja API
Integracja z backendem będzie realizowana poprzez wstrzyknięcie serwisu `ShoppingListControllerRestService`.

- **Pobieranie list:**
  - **Akcja:** Wywołanie w `ngOnInit` komponentu `ListsViewComponent`.
  - **Metoda:** `shoppingListControllerRestService.getAllListsForUser(pageable)`
  - **Typ żądania:** `Pageable` (np. `{ page: 0, size: 20, sort: ['updatedAt,desc'] }`)
  - **Typ odpowiedzi:** `Observable<PageShoppingListSummaryResponse>`

- **Tworzenie nowej listy:**
  - **Akcja:** Przesłanie formularza w `CreateListModalComponent`.
  - **Metoda:** `shoppingListControllerRestService.createList(request)`
  - **Typ żądania:** `CreateShoppingListRequest` (np. `{ name: 'Nowa lista' }`)
  - **Typ odpowiedzi:** `Observable<ShoppingListResponse>`

- **Usuwanie listy:**
  - **Akcja:** Potwierdzenie usunięcia w modalu.
  - **Metoda:** `shoppingListControllerRestService.deleteList(id)` (zakładając istnienie tej metody w serwisie)
  - **Typ żądania:** `id` listy (numer)
  - **Typ odpowiedzi:** `Observable<void>`

## 8. Interakcje użytkownika
- **Nawigacja do szczegółów:** Kliknięcie na dowolny element `ShoppingListItemComponent` powoduje wywołanie `router.navigate(['/lists', listId])`.
- **Tworzenie listy:** Kliknięcie na FAB otwiera `CreateListModalComponent`. Pomyślne przesłanie formularza zamyka modal i dynamicznie dodaje nową listę na górze widoku bez przeładowania strony.
- **Usuwanie listy:** Kliknięcie przycisku "Usuń" na karcie listy (dostępne tylko dla właściciela) otwiera modal z prośbą o potwierdzenie. Po zatwierdzeniu, lista jest usuwana z API i dynamicznie z interfejsu.

## 9. Warunki i walidacja
- **Widoczność przycisku "Usuń":** Przycisk usuwania na karcie listy jest renderowany warunkowo, tylko jeśli `list.isOwner` ma wartość `true`.
- **Walidacja formularza tworzenia listy:**
  - Pole `name` w `CreateListModalComponent` jest powiązane z `FormControl` z walidatorami `Validators.required` i `Validators.maxLength(255)`.
  - Przycisk "Utwórz" jest nieaktywny (`disabled`), dopóki formularz nie jest poprawny.
  - Komunikaty o błędach walidacji są wyświetlane pod polem tekstowym w czasie rzeczywistym.

## 10. Obsługa błędów
- **Błąd pobierania list:** Jeśli wywołanie `getAllListsForUser` zakończy się błędem, stan aplikacji zostanie zaktualizowany (`status: 'error'`), a na ekranie pojawi się komunikat o błędzie z możliwością ponowienia próby.
- **Błąd tworzenia listy:**
  - **Błąd walidacji (400):** Komunikat błędu zwrócony przez API zostanie wyświetlony pod odpowiednim polem w formularzu w modalu.
  - **Inne błędy (np. 500):** W modalu zostanie wyświetlony ogólny komunikat o niepowodzeniu operacji.
- **Błąd usuwania listy:** W przypadku niepowodzenia operacji usuwania, użytkownik zostanie poinformowany za pomocą powiadomienia typu "toast" lub "snackbar" (np. "Nie udało się usunąć listy").

## 11. Kroki implementacji
1.  **Utworzenie struktury plików:** Wygenerowanie wszystkich wymaganych, samodzielnych (standalone) komponentów za pomocą Angular CLI: `ListsViewComponent`, `ShoppingListItemComponent`, `CreateListModalComponent`, `EmptyStateComponent`, `SkeletonLoaderComponent`.
2.  **Konfiguracja routingu:** Dodanie nowej ścieżki `/lists` do głównego pliku routingu, wskazującej na `ListsViewComponent` i zabezpieczenie jej za pomocą `AuthGuard`.
3.  **Implementacja `ListsViewComponent`:**
    - Zdefiniowanie sygnału `state` do zarządzania stanem widoku.
    - Wstrzyknięcie `ShoppingListControllerRestService` i `Router`.
    - Implementacja logiki pobierania danych w `ngOnInit` i aktualizacji stanu.
    - Stworzenie szablonu HTML z użyciem `@if` i `@for` do renderowania komponentów podrzędnych na podstawie stanu.
    - Dodanie pływającego przycisku akcji (FAB).
4.  **Implementacja `ShoppingListItemComponent`:**
    - Zdefiniowanie `InputSignal` dla propsa `list`.
    - Zdefiniowanie `Output` dla zdarzeń `navigate` i `delete`.
    - Stworzenie szablonu karty z użyciem TailwindCSS, wyświetlającego dane z `list` i warunkowo renderującego przycisk usuwania oraz ikonę udostępnienia.
5.  **Implementacja `CreateListModalComponent`:**
    - Stworzenie formularza reaktywnego z jednym polem i odpowiednimi walidatorami.
    - Implementacja logiki przesyłania formularza, wywołania API i obsługi odpowiedzi (sukces/błąd).
    - Zamknięcie modala i zwrócenie danych nowej listy w przypadku sukcesu.
6.  **Integracja modali:** W `ListsViewComponent` zaimplementowanie logiki otwierania `CreateListModalComponent` (po kliknięciu FAB) oraz modala potwierdzającego usunięcie, z użyciem serwisu `MatDialog`.
7.  **Stylowanie:** Implementacja stylów dla wszystkich komponentów za pomocą klas użytkowych TailwindCSS.
8.  **Finalizacja i testowanie:** Przetestowanie wszystkich ścieżek użytkownika: stanu ładowania, pustego stanu, wyświetlania listy, tworzenia nowej listy (z walidacją), usuwania listy oraz obsługi błędów API.
