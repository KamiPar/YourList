# Architektura UI dla YourList

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika aplikacji YourList została zaprojektowana w oparciu o podejście "mobile-first", aby zapewnić optymalne doświadczenie na małych urządzeniach mobilnych, które są głównym celem dla MVP. Struktura jest minimalistyczna i skoncentrowana na zadaniach, aby maksymalnie uprościć proces tworzenia i zarządzania listami zakupów.

Aplikacja będzie składać się z kilku głównych widoków: ekranów autoryzacji, widoku zbiorczego list, widoku szczegółów pojedynczej listy oraz ekranu ustawień. Nawigacja dla zalogowanych użytkowników będzie oparta na dolnym pasku kart (Tab Bar), zapewniając szybki dostęp do kluczowych sekcji.

Zarządzanie stanem aplikacji zostanie scentralizowane przy użyciu biblioteki Elf, co umożliwi efektywną obsługę danych z REST API, aktualizacji w czasie rzeczywistym przez WebSocket oraz pełną funkcjonalność w trybie offline.

## 2. Lista widoków

### - Nazwa widoku: Widok Rejestracji
- **Ścieżka widoku:** `/register`
- **Główny cel:** Umożliwienie nowym użytkownikom stworzenia konta.
- **Kluczowe informacje do wyświetlenia:** Formularz z polami na adres e-mail i hasło.
- **Kluczowe komponenty widoku:**
    - Komponent `AuthLayout` (współdzielony z widokiem logowania).
    - Formularz rejestracji z walidacją.
    - Komunikaty o błędach (np. "E-mail jest już zajęty", "Hasło jest za krótkie").
    - Link do widoku logowania.
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Prosty, jednoetapowy formularz. Po pomyślnej rejestracji użytkownik jest automatycznie logowany i przekierowywany do widoku "Moje listy".
    - **Dostępność:** Pola formularza mają odpowiednie etykiety (`<label>`), a komunikaty o błędach są powiązane z polami za pomocą `aria-describedby`.
    - **Bezpieczeństwo:** Komunikacja z API odbywa się przez HTTPS. Hasło nie jest przechowywane w stanie aplikacji.

### - Nazwa widoku: Widok Logowania
- **Ścieżka widoku:** `/login`
- **Główny cel:** Umożliwienie istniejącym użytkownikom zalogowania się na swoje konto.
- **Kluczowe informacje do wyświetlenia:** Formularz z polami na adres e-mail i hasło.
- **Kluczowe komponenty widoku:**
    - Komponent `AuthLayout`.
    - Formularz logowania.
    - Komunikaty o błędach (np. "Nieprawidłowy e-mail lub hasło").
    - Link do widoku rejestracji.
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Po zalogowaniu użytkownik jest przekierowywany do widoku "Moje listy". Jeśli w `local storage` istnieje lista gościa, pojawia się modal z pytaniem o migrację.
    - **Dostępność:** Zapewnione odpowiednie etykiety i obsługa błędów.
    - **Bezpieczeństwo:** Token JWT otrzymany z API jest zapisywany w `localStorage`.

### - Nazwa widoku: Widok "Moje Listy"
- **Ścieżka widoku:** `/lists`
- **Główny cel:** Wyświetlenie wszystkich list zakupów użytkownika (własnych i udostępnionych) oraz umożliwienie tworzenia nowych.
- **Kluczowe informacje do wyświetlenia:** Lista list z ich nazwami, liczbą produktów i datą ostatniej modyfikacji.
- **Kluczowe komponenty widoku:**
    - Nagłówek z tytułem.
    - Komponent `ShoppingListItem` (karta) dla każdej listy, z wizualnym oznaczeniem list udostępnionych (np. ikoną).
    - Przycisk "Usuń" na karcie listy (widoczny tylko dla właściciela).
    - Pływający przycisk akcji (FAB) do tworzenia nowej listy.
    - Komponent "Empty State" z grafiką i wezwaniem do działania, gdy użytkownik nie ma żadnych list.
    - Skeleton loader wyświetlany podczas ładowania list.
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Listy są sortowane od najnowszej. Kliknięcie na listę przenosi do jej szczegółów. Tworzenie nowej listy odbywa się przez modal.
    - **Dostępność:** Każda lista jest elementem nawigacyjnym. Akcje (jak usuwanie) mają etykiety `aria-label`.
    - **Bezpieczeństwo:** Dostęp do tego widoku jest chroniony (wymaga zalogowania).

### - Nazwa widoku: Widok Szczegółów Listy
- **Ścieżka widoku:** `/lists/{id}`
- **Główny cel:** Zarządzanie produktami na konkretnej liście zakupów.
- **Kluczowe informacje do wyświetlenia:** Nazwa listy, lista produktów podzielona na sekcje "do kupienia" i "kupione".
- **Kluczowe komponenty widoku:**
    - Nagłówek z nazwą listy (edytowalną "inline" dla właściciela) i przyciskiem "Wróć".
    - Przycisk "Udostępnij", otwierający komponent "Bottom Sheet".
    - Formularz dodawania nowego produktu.
    - Komponent `ProductItem` dla każdego produktu (z checkboxem, nazwą i opisem edytowalnymi "inline").
    - Komponent "Empty State", gdy lista nie zawiera żadnych produktów.
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Zmiany (dodanie, oznaczenie jako kupiony) są odzwierciedlane natychmiast (optymistyczna aktualizacja). Zmiany od innych użytkowników pojawiają się w czasie rzeczywistym. Sortowanie odbywa się po stronie klienta.
    - **Dostępność:** Wszystkie elementy interaktywne mają odpowiednio duży obszar dotyku (min. 44x44px).
    - **Bezpieczeństwo:** Aplikacja weryfikuje, czy użytkownik ma dostęp do listy o danym `{id}`.

### - Nazwa widoku: Widok Ustawień
- **Ścieżka widoku:** `/settings`
- **Główny cel:** Zarządzanie kontem użytkownika.
- **Kluczowe informacje do wyświetlenia:** Adres e-mail zalogowanego użytkownika.
- **Kluczowe komponenty widoku:**
    - Przycisk "Wyloguj".
    - Sekcja "Usuń konto" z polem do wpisania hasła w celu potwierdzenia i przyciskiem akcji.
    - Okno dialogowe do ostatecznego potwierdzenia usunięcia konta.
- **UX, dostępność i względy bezpieczeństwa:**
    - **UX:** Akcje krytyczne, jak usunięcie konta, wymagają podwójnego potwierdzenia.
    - **Dostępność:** Wszystkie akcje są jasno opisane.
    - **Bezpieczeństwo:** Usunięcie konta wymaga potwierdzenia hasłem.

## 3. Mapa podróży użytkownika

1.  **Niezalogowany użytkownik:**
    - Ląduje na stronie głównej, może od razu zacząć tworzyć listę (tryb gościa).
    - Alternatywnie, przechodzi do `/login` lub `/register`.
2.  **Rejestracja i pierwsze logowanie:**
    - Użytkownik wypełnia formularz w `/register`.
    - Po sukcesie jest przekierowywany do `/lists`.
    - Jeśli istniała lista gościa, jest pytany o jej migrację.
3.  **Zarządzanie listami:**
    - W `/lists` tworzy nową listę za pomocą FAB.
    - Klika na istniejącą listę, aby przejść do `/lists/{id}`.
    - W `/lists/{id}` dodaje produkty, odznacza je jako kupione, edytuje ich nazwy.
4.  **Współdzielenie:**
    - W `/lists/{id}` klika "Udostępnij".
    - Kopiuje link i wysyła go innej osobie.
    - Odbiorca (zalogowany) klika link, jest przekierowywany do `/join/{token}`, a następnie do `/lists/{id}` udostępnionej listy.
5.  **Tryb offline:**
    - Użytkownik traci połączenie z internetem.
    - W UI pojawia się globalny wskaźnik.
    - Użytkownik kontynuuje pracę z listą (dodaje/odznacza produkty). Zmiany są zapisywane lokalnie.
    - Po odzyskaniu połączenia, zmiany są synchronizowane, a użytkownik otrzymuje powiadomienie.

## 4. Układ i struktura nawigacji

- **Układ główny:** Aplikacja będzie miała główny komponent layoutu, który zawierać będzie górny pasek (nagłówek) oraz dolny pasek nawigacyjny (Tab Bar).
- **Nawigacja (dla zalogowanych):**
    - **Dolny pasek kart (Tab Bar):**
        - **Moje Listy** (ikona listy) - prowadzi do `/lists`.
        - **Ustawienia** (ikona zębatki) - prowadzi do `/settings`.
- **Routing:**
    - `AuthGuard` będzie chronił ścieżki `/lists`, `/lists/{id}`, `/settings`.
    - `GuestGuard` będzie przekierowywał zalogowanych użytkowników z `/login` i `/register` do `/lists`.
    - Ścieżka `/join/{token}` będzie obsługiwana przez dedykowany komponent, który wywoła API i przekieruje użytkownika.

## 5. Kluczowe komponenty

- **`AuthLayout`:** Wspólny layout dla ekranów logowania i rejestracji.
- **`MainLayout`:** Główny layout aplikacji dla zalogowanych użytkowników, zawierający Tab Bar.
- **`ShoppingListItem`:** Karta reprezentująca pojedynczą listę w widoku "Moje Listy".
- **`ProductItem`:** Element reprezentujący pojedynczy produkt w widoku szczegółów listy.
- **`OfflineIndicator`:** Globalny komponent wyświetlający status połączenia.
- **`ConfirmationDialog`:** Generyczny modal do potwierdzania akcji destruktywnych.
- **`ShareBottomSheet`:** Komponent wyświetlający opcje udostępniania listy.
- **`SkeletonLoader`:** Komponent do wyświetlania animowanego placeholdera podczas ładowania danych.
