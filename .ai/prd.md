# Dokument wymagań produktu (PRD) - YourList
## 1. Przegląd produktu
Aplikacja webowa YourList to inteligentna lista zakupów zaprojektowana w celu usprawnienia procesu zakupów spożywczych dla rodzin i współlokatorów. Głównym celem jest eliminacja problemu podwójnych zakupów poprzez umożliwienie współdzielenia list i synchronizacji zmian w czasie rzeczywistym. Aplikacja pozwala na tworzenie i zarządzanie listami zarówno przez zalogowanych, jak i niezalogowanych użytkowników, z naciskiem na prostotę, intuicyjność i płynną współpracę.

## 2. Problem użytkownika
Zakupy spożywcze realizowane równolegle przez dwóch lub więcej członków gospodarstwa domowego po pracy są nieefektywne i prowadzą do frustracji. Brak łatwego sposobu na koordynację listy zakupów w czasie rzeczywistym skutkuje częstym kupowaniem tych samych produktów, co generuje niepotrzebne wydatki i marnotrawstwo żywności. Konieczność wcześniejszego, manualnego podziału listy jest niewygodna i nieelastyczna.

## 3. Wymagania funkcjonalne
### 3.1. System Kont Użytkowników
- Rejestracja przy użyciu adresu e-mail (jako loginu) i hasła.
- Logowanie do systemu.
- Możliwość usunięcia konta przez użytkownika.

### 3.2. Zarządzanie Listami Zakupów (CRUD)
- Tworzenie, odczyt, edycja nazwy i usuwanie list zakupów.
- Wszystkie listy użytkownika (własne i udostępnione) są widoczne w jednym widoku "Moje listy".
### 3.3. Zarządzanie Produktami na Liście (CRUD)
- Dodawanie produktu do listy z nazwą oraz opcjonalnym polem tekstowym na ilość/opis.
- Oznaczanie i odznaczanie produktów jako "kupione".
- Produkty oznaczone jako kupione są wizualnie zmienione (przekreślone, wyszarzone) i przenoszone na dół listy.

### 3.4. Współdzielenie i Synchronizacja
- Udostępnianie list wyłącznie innym zalogowanym użytkownikom poprzez wygenerowanie unikalnego, stałego linku.
- Zmiany statusu produktów (dodanie, oznaczenie jako kupiony) na współdzielonych listach są synchronizowane w czasie rzeczywistym.
- Konflikty edycji rozwiązywane są metodą "ostatni zapis wygrywa" (last write wins).

### 3.5. Tryb Użytkownika Niezalogowanego
- Użytkownik niezalogowany może tworzyć, edytować i zarządzać jedną listą zakupów.
- Lista użytkownika niezalogowanego jest przechowywana w local storage przeglądarki.
- Po rejestracji lub zalogowaniu, system wykrywa lokalną listę i proponuje jej migrację na konto użytkownika.

### 3.6. Tryb Offline
- Aplikacja jest funkcjonalna bez aktywnego połączenia z internetem.
- Użytkownik może dodawać produkty i oznaczać je jako kupione w trybie offline.
- Zmiany są automatycznie synchronizowane z serwerem po odzyskaniu połączenia.
- W interfejsie użytkownika widoczny jest dyskretny wskaźnik informujący o statusie offline.

## 4. Granice projektu
### 4.1. Funkcjonalności w zakresie MVP
- Zapisywanie, odczytywanie, przeglądanie i usuwanie list zakupów.
- Prosty system kont użytkowników (e-mail + hasło) do powiązania użytkownika z listami.
- Współdzielenie listy zakupów dla wielu zalogowanych użytkowników w czasie rzeczywistym.

### 4.2. Funkcjonalności poza zakresem MVP
- Współdzielenie list pomiędzy użytkownikami zalogowanymi i niezalogowanymi.
- Tworzenie list zakupów na podstawie przepisów kulinarnych.
- Funkcje importu i eksportu list.
- Zaawansowane zarządzanie użytkownikami na liście (np. usuwanie dostępu).
- Informowanie o obecności innych użytkowników na liście w czasie rzeczywistym.
- Wbudowany samouczek lub przewodnik po aplikacji.
- Tworzenie, edycja i odczyt listy zakupów dla użytkowników niezalogowanych (zapis w local storage).

## 5. Historyjki użytkowników
### ID: US-001
- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę móc założyć konto przy użyciu mojego adresu e-mail i hasła, aby móc zapisywać swoje listy na serwerze i współdzielić je z innymi.
- Kryteria akceptacji:
  - Formularz rejestracji zawiera pola na adres e-mail i hasło.
  - System waliduje poprawność formatu adresu e-mail.
  - System wymaga hasła o minimalnej długości (np. 8 znaków).
  - Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany i przekierowany do widoku "Moje listy".
  - W przypadku, gdy e-mail jest już zajęty, wyświetlany jest odpowiedni komunikat błędu.

### ID: US-002
- Tytuł: Logowanie do aplikacji
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się na swoje konto, aby uzyskać dostęp do moich list zakupów.
- Kryteria akceptacji:
  - Formularz logowania zawiera pola na adres e-mail i hasło.
  - Po poprawnym wprowadzeniu danych, użytkownik jest przekierowany do widoku "Moje listy".
  - W przypadku błędnych danych logowania, wyświetlany jest stosowny komunikat.


### ID: US-003
- Tytuł: Tworzenie nowej listy zakupów (zalogowany użytkownik)
- Opis: Jako zalogowany użytkownik, chcę móc stworzyć nową, pustą listę zakupów i nadać jej nazwę.
- Kryteria akceptacji:
  - W widoku "Moje listy" znajduje się przycisk do tworzenia nowej listy.
  - Po kliknięciu przycisku, użytkownik jest proszony o podanie nazwy dla nowej listy.
  - Nowa lista pojawia się na górze widoku "Moje listy".

### ID: US-004
- Tytuł: Usuwanie listy zakupów
- Opis: Jako właściciel listy, chcę móc ją trwale usunąć, gdy nie jest mi już potrzebna.
- Kryteria akceptacji:
  - Przy każdej liście znajduje się opcja jej usunięcia.
  - Przed usunięciem listy wyświetlane jest okno dialogowe z prośbą o potwierdzenie operacji.
  - Po potwierdzeniu, lista jest trwale usuwana z systemu, a link do niej staje się nieaktywny.

### ID: US-005
- Tytuł: Dodawanie produktu do listy
- Opis: Będąc na ekranie listy, chcę móc szybko dodać nowy produkt, podając jego nazwę i opcjonalnie ilość.
- Kryteria akceptacji:
  - Na ekranie listy znajduje się pole do wpisania nazwy nowego produktu.
  - Obok pola nazwy znajduje się opcjonalne pole tekstowe na ilość/opis.
  - Po dodaniu, produkt pojawia się na liście w sekcji "do kupienia".

### ID: US-006
- Tytuł: Oznaczanie produktu jako kupiony
- Opis: Będąc w sklepie, chcę móc oznaczyć produkt jako kupiony, aby wiedzieć, co już mam w koszyku i poinformować o tym współdzielących listę.
- Kryteria akceptacji:
  - Każdy produkt na liście ma checkbox lub podobny element do oznaczenia go jako kupiony.
  - Po oznaczeniu, produkt jest przekreślany, wyszarzany i przenoszony na dół listy, do sekcji "kupione".
  - Zmiana statusu jest natychmiast widoczna dla innych użytkowników współdzielących listę (jeśli są online).

### ID: US-007
- Tytuł: Udostępnianie listy innemu użytkownikowi
- Opis: Jako właściciel listy, chcę móc wygenerować unikalny link i wysłać go innej osobie, aby mogła ona dołączyć do mojej listy i wspólnie robić zakupy.
- Kryteria akceptacji:
  - Na ekranie listy znajduje się przycisk "Udostępnij".
  - Po kliknięciu generowany jest unikalny, stały link do tej listy, który można skopiować.
  - Dostęp do listy przez link mają tylko zalogowani użytkownicy.

### ID: US-008
- Tytuł: Tworzenie listy przez niezalogowanego użytkownika
- Opis: Jako nowy użytkownik, chcę móc od razu stworzyć listę zakupów bez konieczności rejestracji, aby szybko zapisać potrzebne produkty.
- Kryteria akceptacji:
  - Aplikacja pozwala na stworzenie i edycję jednej listy bez logowania.
  - Lista jest zapisywana w local storage przeglądarki.
  - Użytkownik jest informowany, że lista jest lokalna i do jej synchronizacji/współdzielenia potrzebna jest rejestracja.

### ID: US-009
- Tytuł: Migracja lokalnej listy na konto
- Opis: Jako użytkownik, który stworzył listę będąc niezalogowanym, chcę po rejestracji przenieść ją na moje konto, aby jej nie stracić i móc ją udostępnić.
- Kryteria akceptacji:
  - Po zalogowaniu/rejestracji system wykrywa istnienie listy w local storage.
  - Wyświetlany jest komunikat z pytaniem, czy użytkownik chce przenieść lokalną listę na swoje konto.
  - Po potwierdzeniu, lista jest zapisywana na serwerze, a lokalna kopia jest usuwana.

### ID: US-010
- Tytuł: Korzystanie z aplikacji w trybie offline
- Opis: Będąc w supermarkecie ze słabym zasięgiem, chcę móc normalnie korzystać z listy i odznaczać produkty, mając pewność, że zmiany zsynchronizują się po odzyskaniu połączenia.
- Kryteria akceptacji:
  - Aplikacja pozostaje w pełni funkcjonalna w trybie offline (dodawanie/odznaczanie produktów).
  - W interfejsie pojawia się dyskretny wskaźnik informujący o braku połączenia.
  - Po powrocie do trybu online, wszystkie zmiany dokonane offline są automatycznie wysyłane na serwer.

### ID: US-011
- Tytuł: Widok wszystkich list
- Opis: Jako zalogowany użytkownik, chcę widzieć wszystkie moje listy - zarówno te, które stworzyłem, jak i te, które mi udostępniono - w jednym miejscu.
- Kryteria akceptacji:
  - Ekran "Moje listy" wyświetla listę wszystkich list powiązanych z użytkownikiem.
  - Listy udostępnione są wizualnie odróżnione od list własnych.
  - Listy są posortowane od najnowszej do najstarszej na podstawie daty ostatniej modyfikacji.

### ID: US-012
- Tytuł: Usuwanie konta
- Opis: Jako użytkownik, chcę mieć możliwość trwałego usunięcia mojego konta i wszystkich powiązanych z nim danych.
- Kryteria akceptacji:
  - W ustawieniach konta znajduje się opcja "Usuń konto".
  - Przed usunięciem konta wymagane jest potwierdzenie operacji (np. przez wpisanie hasła).
  - Usunięcie konta powoduje trwałe usunięcie wszystkich list stworzonych przez użytkownika i unieważnienie linków do nich.

## 6. Metryki sukcesu
### 6.1. Cel: Wysoki odsetek zarejestrowanych użytkowników
- Metryka: 90% aktywnych użytkowników to użytkownicy zarejestrowani.
- Pomiar: Stosunek liczby zarejestrowanych aktywnych użytkowników do łącznej liczby wszystkich aktywnych użytkowników (w tym sesji niezarejestrowanych) w danym okresie. Aktywny użytkownik to taki, który stworzył listę i wykonał na niej operację (dodał/odznaczył produkt, udostępnił).

### 6.2. Cel: Wysokie zaangażowanie użytkowników
- Metryka: 75% zarejestrowanych użytkowników generuje 3 lub więcej nowych list w miesiącu.
- Pomiar: Śledzenie liczby list utworzonych przez każdego zarejestrowanego użytkownika w cyklach miesięcznych.

### 6.3. Kluczowe zdarzenia do śledzenia analitycznego
- user_registered
- list_created
- list_shared
- item_added_to_list
- item_checked_as_bought
