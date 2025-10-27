# Plan implementacji widoku Logowania

## 1. Przegląd
Widok logowania umożliwia zarejestrowanym użytkownikom dostęp do ich konta w aplikacji YourList. Użytkownik podaje swój adres e-mail i hasło, a po pomyślnej weryfikacji jest przekierowywany do głównego widoku aplikacji – "Moje listy". Widok ten obsługuje również komunikację błędów oraz stanowi punkt wejścia do procesu migracji listy gościa, jeśli taka istnieje w `localStorage`.

## 2. Routing widoku
Widok będzie dostępny pod następującą ścieżką:
- **Ścieżka:** `/login`
- **Moduł Routingu:** Główny plik `app.routes.ts`.
- **Ochrona (Guard):** Zaleca się zastosowanie `canActivate` guard, który będzie przekierowywał już zalogowanych użytkowników z `/login` do `/my-lists`.

## 3. Struktura komponentów
Hierarchia komponentów dla widoku logowania będzie następująca. Komponenty będą implementowane jako `standalone`.

```
AuthLayoutComponent
└── LoginView (komponent routowalny)
    └── LoginFormComponent
```

- **`AuthLayoutComponent`**: Komponent layoutu, który zapewnia spójny wygląd dla wszystkich widoków uwierzytelniania (logowanie, rejestracja). Wyświetla logo aplikacji i centruje zawartość.
- **`LoginView`**: Komponent "smart", odpowiedzialny za logikę biznesową, zarządzanie stanem i komunikację z API.
- **`LoginFormComponent`**: Komponent "dumb", odpowiedzialny za prezentację formularza, walidację pól i emitowanie zdarzeń do rodzica.

## 4. Szczegóły komponentów
### `LoginView`
- **Opis komponentu**: Główny kontener widoku logowania. Zarządza stanem procesu logowania (np. `loading`, `error`), obsługuje wywołania API poprzez wstrzyknięty serwis i reaguje na wyniki tych wywołań (przekierowanie lub wyświetlenie błędu).
- **Główne elementy**: Wykorzystuje `LoginFormComponent` do wyświetlenia formularza. Implementuje logikę warunkowego wyświetlania komunikatów o błędach na podstawie stanu.
- **Obsługiwane interakcje**:
  - Odbiera zdarzenie `loginSubmit` z `LoginFormComponent`.
  - Po otrzymaniu danych wywołuje metodę logowania w `AuthService`.
  - W przypadku sukcesu, zapisuje token JWT i przekierowuje użytkownika.
  - W przypadku błędu, aktualizuje stan, aby wyświetlić komunikat błędu.
- **Obsługiwana walidacja**: Brak – walidacja jest delegowana do `LoginFormComponent`.
- **Typy**: `LoginViewModel`, `UserLoginRequest`.
- **Propsy**: Brak (jest to komponent routowalny).

### `LoginFormComponent`
- **Opis komponentu**: Prezentacyjny komponent formularza logowania. Zawiera pola na e-mail i hasło, przycisk do wysłania formularza oraz miejsce na wyświetlenie błędów walidacji i błędów z API.
- **Główne elementy**:
  - `form` z `FormGroup` z `FormControl` dla `email` i `password`.
  - `input` dla adresu e-mail (`type="email"`).
  - `input` dla hasła (`type="password"`).
  - `button` do wysłania formularza (`type="submit"`).
  - Element do wyświetlania komunikatu o błędzie przekazanego z `LoginView`.
  - `a` (link) do nawigacji do widoku rejestracji (`/register`).
- **Obsługiwane interakcje**:
  - Emituje zdarzenie `(loginSubmit)` z danymi formularza (`UserLoginRequest`), gdy formularz jest poprawny i zostanie wysłany.
- **Obsługiwana walidacja**:
  - **Email**:
    - Pole wymagane (`Validators.required`).
    - Musi być poprawnym formatem adresu e-mail (`Validators.email`).
  - **Hasło**:
    - Pole wymagane (`Validators.required`).
- **Typy**: `UserLoginRequest`.
- **Propsy**:
  - `isSubmitting: boolean`: Informuje, czy proces logowania jest w toku (do blokowania przycisku).
  - `apiError: string | null`: Komunikat błędu z API do wyświetlenia.

## 5. Typy
Do implementacji widoku wymagane będą następujące typy, zgodne z DTO backendu.

- **`UserLoginRequest` (DTO żądania)**: Obiekt wysyłany do API.
  ```typescript
  export interface UserLoginRequest {
    email: string;
    password: string;
  }
  ```

- **`UserLoginResponse` (DTO odpowiedzi)**: Obiekt otrzymywany z API po pomyślnym zalogowaniu.
  ```typescript
  export interface UserLoginResponse {
    id: number;
    email: string;
    token: string;
  }
  ```

- **`LoginViewModel` (Model widoku)**: Reprezentuje stan komponentu `LoginView`.
  ```typescript
  export interface LoginViewModel {
    status: 'idle' | 'loading' | 'success' | 'error';
    error: string | null;
  }
  ```

## 6. Zarządzanie stanem
Zarządzanie stanem w `LoginView` będzie realizowane przy użyciu sygnałów (Signals) z Angulara, zgodnie z najnowszymi praktykami.

- **`state = signal<LoginViewModel>({ status: 'idle', error: null })`**: Główny sygnał przechowujący stan widoku.
- Zmiany stanu będą dokonywane za pomocą metody `update` na sygnale, co zapewni reaktywność i automatyczne odświeżanie widoku.
  - Przy starcie logowania: `status` zmienia się na `'loading'`.
  - Po sukcesie: `status` zmienia się na `'success'`.
  - W razie błędu: `status` zmienia się na `'error'`, a pole `error` jest uzupełniane komunikatem.

Nie ma potrzeby tworzenia dedykowanego customowego hooka (serwisu stanu) dla tak prostego widoku. Logika zostanie zawarta w komponencie `LoginView`.

## 7. Integracja API
Integracja z backendem będzie realizowana poprzez wstrzyknięty `AuthService`, który będzie hermetyzował logikę zapytań HTTP.

- **Endpoint**: `POST /api/auth/login`
- **Serwis**: `AuthService`
- **Metoda w serwisie**: `login(credentials: UserLoginRequest): Observable<UserLoginResponse>`
- **Przepływ**:
  1. Komponent `LoginView` wywołuje `authService.login(credentials)`.
  2. Serwis wysyła żądanie `POST` z ciałem typu `UserLoginRequest`.
  3. Serwis nasłuchuje na odpowiedź i w przypadku sukcesu zwraca `Observable` z danymi typu `UserLoginResponse`.
  4. W przypadku błędu (np. status 401), serwis przechwytuje błąd i propaguje go do komponentu, który go obsłuży.
  5. Po pomyślnym zalogowaniu, `AuthService` będzie również odpowiedzialny za zapisanie otrzymanego tokenu JWT w `localStorage` za pomocą metody `saveToken(token: string)`.

## 8. Interakcje użytkownika
- **Wpisywanie danych w formularzu**: Pola formularza są aktualizowane, a walidacja jest uruchamiana na bieżąco (np. po utracie fokusu).
- **Kliknięcie przycisku "Zaloguj się"**:
  - **Gdy formularz jest niepoprawny**: Wyświetlane są komunikaty walidacyjne pod odpowiednimi polami. Żądanie do API nie jest wysyłane.
  - **Gdy formularz jest poprawny**: Przycisk jest blokowany, a stan aplikacji zmienia się na `loading`.
- **Pomyślne zalogowanie**: Użytkownik jest przekierowywany na ścieżkę `/my-lists`.
- **Błędne dane logowania**: Pod formularzem pojawia się komunikat błędu (np. "Nieprawidłowy e-mail lub hasło"). Przycisk zostaje odblokowany.
- **Kliknięcie linku "Zarejestruj się"**: Użytkownik jest przekierowywany na ścieżkę `/register`.

## 9. Warunki i walidacja
- **Walidacja po stronie klienta (w `LoginFormComponent`)**:
  - **Email**: Musi być podany i mieć format adresu e-mail. Komunikat: "Pole jest wymagane" lub "Wprowadź poprawny adres e-mail".
  - **Hasło**: Musi być podane. Komunikat: "Pole jest wymagane".
- **Warunki interfejsu**:
  - Przycisk "Zaloguj się" jest nieaktywny (`disabled`), jeśli formularz jest niepoprawny lub trwa proces wysyłania (`isSubmitting`).
  - Komunikat o błędzie z API jest widoczny tylko wtedy, gdy `state.status === 'error'`.

## 10. Obsługa błędów
- **Błędy walidacji formularza**: Obsługiwane przez Angular Reactive Forms. Komunikaty są wyświetlane przy polach, których dotyczą.
- **Błąd `401 Unauthorized` (nieprawidłowe dane)**: `AuthService` przechwytuje błąd. `LoginView` aktualizuje swój stan, ustawiając `status` na `'error'` i przekazując komunikat z ciała odpowiedzi API (`"Invalid email or password"`) do `LoginFormComponent`.
- **Błędy sieciowe lub serwera (np. 500)**: `AuthService` powinien przechwycić również te błędy. `LoginView` wyświetli generyczny komunikat, np. "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później."

## 11. Kroki implementacji
1. **Utworzenie struktury plików**: Stworzenie plików dla komponentów `LoginView` i `LoginFormComponent` oraz `AuthLayoutComponent` za pomocą schematów Nx/Angular CLI (`nx g c ... --standalone`).
2. **Konfiguracja routingu**: Dodanie nowej ścieżki `/login` w `app.routes.ts`, która będzie wskazywać na `LoginView`.
3. **Implementacja `AuthLayoutComponent`**: Stworzenie podstawowego layoutu z wyśrodkowaną treścią i logo aplikacji.
4. **Implementacja `LoginFormComponent`**:
   - Zbudowanie formularza reaktywnego z polami `email` i `password`.
   - Dodanie walidatorów (`required`, `email`).
   - Ostylowanie formularza za pomocą TailwindCSS.
   - Implementacja logiki emitowania zdarzenia `(loginSubmit)`.
   - Dodanie `Input()` dla `isSubmitting` i `apiError`.
5. **Implementacja `LoginView`**:
   - Wstrzyknięcie `FormBuilder`, `Router` i `AuthService`.
   - Implementacja logiki obsługi zdarzenia `(loginSubmit)`.
   - Utworzenie sygnału `state` do zarządzania stanem widoku.
   - Wywołanie metody `authService.login()` i obsługa odpowiedzi (sukces/błąd).
6. **Aktualizacja `AuthService`**:
   - Dodanie metody `login()` wysyłającej żądanie `POST` do `/api/auth/login`.
   - Dodanie metody `saveToken()` zapisującej token w `localStorage`.
7. **Integracja komponentów**: Umieszczenie `LoginFormComponent` w szablonie `LoginView` i powiązanie propsów oraz zdarzeń.
8. **Obsługa migracji listy gościa**: Po pomyślnym zalogowaniu, przed przekierowaniem, dodać logikę sprawdzającą `localStorage` w poszukiwaniu listy gościa i uruchamiającą odpowiedni modal.
9. **Testowanie manualne**: Przetestowanie wszystkich scenariuszy: pomyślne logowanie, błędne dane, błędy walidacji, działanie linku do rejestracji.
