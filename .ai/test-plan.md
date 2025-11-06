Plan Testów dla Projektu "YourList"
1. Wprowadzenie i Cele Testowania
   Wprowadzenie:
   Niniejszy dokument opisuje strategię, zakres, zasoby i harmonogram działań testowych dla aplikacji "YourList". Projekt ten jest aplikacją webową typu monorepo (Nx), składającą się z backendu opartego na Spring Boot (Java) oraz frontendu w technologii Angular. Aplikacja umożliwia użytkownikom tworzenie list zakupów, zarządzanie produktami na listach oraz udostępnianie ich innym użytkownikom w czasie rzeczywistym za pomocą WebSocketów.
   Główne Cele Testowania:
   Weryfikacja funkcjonalności: Zapewnienie, że wszystkie funkcje aplikacji działają zgodnie z założeniami, w tym zarządzanie listami, produktami 
   Zapewnienie jakości i niezawodności: Identyfikacja i eliminacja błędów w celu dostarczenia stabilnego i godnego zaufania produktu.
   Weryfikacja bezpieczeństwa: Upewnienie się, że dane użytkowników są bezpieczne, a dostęp do zasobów jest odpowiednio kontrolowany.
   Zapewnienie spójności UI/UX: Weryfikacja, czy interfejs użytkownika jest intuicyjny, spójny i responsywny na różnych urządzeniach.
   Weryfikacja integracji: Potwierdzenie poprawnej komunikacji i przepływu danych między frontendem a backendem.
2. Zakres Testów
   W Zakresie (In-Scope)
   Aplikacja Backendowa (Java/Spring Boot):
   Testowanie wszystkich endpointów REST API (uwierzytelnianie, operacje CRUD na listach i produktach, udostępnianie).
   Logika biznesowa w warstwie serwisowej.
   Interakcje z bazą danych PostgreSQL (poprawność zapytań, integralność danych).
   Mechanizmy bezpieczeństwa (autoryzacja oparta na JWT, kontrola dostępu do zasobów).
   Komunikacja przez WebSockets (nawiązywanie połączenia, broadcast wiadomości).
   Aplikacja Frontendowa (Angular):
   Komponenty UI i ich logika.
   Routing i nawigacja w aplikacji.
   Zarządzanie stanem (ListDetailsState).
   Integracja z API backendu poprzez wygenerowany klient OpenAPI.
   Obsługa aktualizacji w czasie rzeczywistym przez WebSockets.
   Walidacja formularzy (tworzenie listy, dodawanie produktu, logowanie).
   Baza Danych:
   Poprawność migracji schematu (Flyway).
   Integralność danych i relacji (klucze obce, ograniczenia).
   Integracja End-to-End:
   Pełne scenariusze użytkownika, obejmujące interakcje w przeglądarce, komunikację z backendem i operacje na bazie danych.
   Poza Zakresem (Out-of-Scope)
   Testowanie wydajnościowe infrastruktury firm trzecich (np. serwerów bazodanowych w chmurze).
   Testowanie bibliotek i frameworków firm trzecich (np. Spring, Angular, Nx) – zakładamy ich poprawność.
   Szczegółowe testy kompatybilności na niszowych lub niewspieranych przeglądarkach.
3. Typy Testów do Przeprowadzenia
   Proces testowania zostanie podzielony na kilka poziomów, aby zapewnić kompleksowe pokrycie.
   Testy Jednostkowe (Unit Tests):
   Backend: Weryfikacja poszczególnych klas serwisów (np. ItemService, ShoppingListService) i maperów w izolacji przy użyciu Mockito. Pokrycie logiki biznesowej, obsługi przypadków brzegowych i walidacji.
   Frontend: Testowanie logiki komponentów Angular, serwisów (np. WebSocketService) oraz klasy zarządzającej stanem (ListDetailsState) przy użyciu Jest. Weryfikacja działania metod, transformacji danych i logiki warunkowej.
   Testy Integracyjne (Integration Tests):
   Backend: Testowanie warstwy kontrolerów (@WebMvcTest) oraz pełnej integracji od endpointu API do bazy danych (@SpringBootTest). Do testów zostanie wykorzystana baza danych w kontenerze (Testcontainers), aby zapewnić spójność ze środowiskiem produkcyjnym. Testy te zweryfikują poprawność działania endpointów, serializację/deserializację DTO, obsługę wyjątków oraz mechanizmy bezpieczeństwa.
   Frontend: Testowanie komponentów wraz z ich szablonami HTML w celu weryfikacji poprawnego renderowania, interakcji użytkownika i komunikacji między komponentami (np. parent-child).
   Testy End-to-End (E2E):
   Symulacja kompletnych scenariuszy użytkownika w przeglądarce. Testy te będą obejmować cały stos technologiczny (frontend -> backend -> baza danych).
   Narzędzie: Rekomendowane jest wprowadzenie frameworka Cypress lub Playwright.
   Przykładowy scenariusz:
   Użytkownik A loguje się do aplikacji.
   Tworzy nową listę zakupów.
   Dodaje kilka produktów do listy.
   Udostępnia listę użytkownikowi B za pomocą tokena.
   Użytkownik B dołącza do listy.
   Użytkownik B oznacza jeden z produktów jako "kupiony".
   Weryfikacja, czy zmiana statusu produktu jest natychmiast widoczna u użytkownika A.
   Testy API:
   Manualne i zautomatyzowane testy kontraktu API zdefiniowanego w specyfikacji OpenAPI.
   Narzędzia: Postman (dla testów eksploracyjnych), Newman (dla automatyzacji w CI/CD).
   Testy obejmą weryfikację kodów odpowiedzi HTTP, formatów danych JSON oraz obsługi błędów.
   Testy Bezpieczeństwa:
   Weryfikacja zabezpieczeń endpointów API – próby dostępu do zasobów bez autoryzacji lub przez nieuprawnionego użytkownika (np. próba edycji nie swojej listy).
   Testowanie walidacji danych wejściowych w celu zapobiegania atakom (np. XSS, SQL Injection).
   Skanowanie zależności projektu (npm, Gradle) w poszukiwaniu znanych podatności.
   Testy Manualne (Eksploracyjne):
   Testowanie aplikacji bez z góry zdefiniowanych scenariuszy w celu znalezienia nieprzewidzianych błędów. Skupienie na UI/UX, intuicyjności i ogólnym wrażeniu z użytkowania aplikacji.
4. Scenariusze Testowe dla Kluczowych Funkcjonalności
   Kategoria	Scenariusz	Priorytet
   Uwierzytelnianie i Autoryzacja	Pomyślna rejestracja i logowanie użytkownika.	Krytyczny
   Próba logowania z błędnym hasłem lub nieistniejącym emailem.	Krytyczny
   Próba dostępu do zabezpieczonego zasobu (np. listy) bez tokena JWT.	Krytyczny
   Próba dostępu do zasobu z nieważnym lub wygasłym tokenem JWT.	Krytyczny
   Użytkownik nie może modyfikować/wyświetlać list, do których nie ma dostępu.	Krytyczny
   Zarządzanie Listami Zakupów	Użytkownik może pomyślnie utworzyć nową listę zakupów.	Wysoki
   Użytkownik widzi wszystkie swoje listy oraz te, które zostały mu udostępnione.	Wysoki
   Właściciel listy może wygenerować token do jej udostępnienia.	Wysoki
   Użytkownik może dołączyć do listy za pomocą poprawnego tokena.	Wysoki
   Próba dołączenia do listy przy użyciu nieprawidłowego tokena kończy się błędem.	Średni
   Użytkownik nie może dołączyć do listy, której jest już członkiem lub właścicielem.	Średni
   Zarządzanie Produktami	Użytkownik (właściciel lub członek) może dodać nowy produkt do listy.	Wysoki
   Użytkownik może usunąć produkt z listy.	Wysoki
   Użytkownik może zmienić status produktu na "kupiony"/"niekupiony".	Wysoki
   Walidacja formularza dodawania produktu (np. pusta nazwa).	Średni
   Aktualizacje w Czasie Rzeczywistym (WebSockets)	Dodanie produktu przez jednego użytkownika jest natychmiast widoczne u drugiego.	Wysoki
   Usunięcie produktu przez jednego użytkownika jest natychmiast widoczne u drugiego.	Wysoki
   Zmiana statusu "kupiony" jest natychmiast synchronizowana między użytkownikami.	Wysoki
5. Środowisko Testowe
   Lokalne środowisko deweloperskie: Uruchomienie aplikacji (backend, frontend, baza danych) za pomocą docker-compose.yml i nx serve.
   Środowisko CI/CD: Skonfigurowane w oparciu o GitHub Actions. Każdy Pull Request będzie uruchamiał automatycznie testy jednostkowe i integracyjne dla backendu i frontendu.
   Baza danych: Dedykowana instancja PostgreSQL dla testów automatycznych, regularnie czyszczona i wypełniana danymi testowymi. W testach integracyjnych backendu zaleca się użycie biblioteki Testcontainers do tworzenia efemerycznych instancji bazy danych.
   Przeglądarki: Testy E2E oraz manualne będą wykonywane na najnowszych wersjach przeglądarek: Google Chrome, Mozilla Firefox.
6. Narzędzia do Testowania
   Cel	Narzędzie	Zastosowanie
   Backend Testing	JUnit 5, Mockito, Spring Test	Testy jednostkowe i integracyjne.
   Baza Danych Testowa	Testcontainers	Izolowane, powtarzalne środowisko bazodanowe dla testów.
   Frontend Testing	Jest, Angular Testing Library	Testy jednostkowe i komponentowe dla Angulara.
   Testy E2E	Playwright 	Automatyzacja scenariuszy użytkownika w przeglądarce.
   Testy API	Postman, Newman	Manualne i zautomatyzowane testy REST API.
   CI/CD	GitHub Actions	Automatyzacja budowania, testowania i wdrażania.
   Zarządzanie Błędami	GitHub Issues / Jira	Śledzenie i zarządzanie cyklem życia błędów.
7. Harmonogram Testów
   Testowanie jest procesem ciągłym, zintegrowanym z cyklem rozwoju oprogramowania.
   Testy jednostkowe i integracyjne: Pisane przez deweloperów równolegle z implementacją nowych funkcjonalności. Uruchamiane lokalnie przed każdym commitem oraz automatycznie w pipeline CI dla każdego Pull Requesta.
   Testy E2E: Uruchamiane automatycznie w pipeline CI po pomyślnym zakończeniu testów jednostkowych i integracyjnych, przed mergem do głównego brancha.
   Testy manualne (eksploracyjne): Wykonywane przed każdym wydaniem nowej wersji aplikacji (release).
   Testy regresji: Pełny zestaw testów automatycznych (jednostkowe, integracyjne, E2E) jest uruchamiany przed każdym wdrożeniem na produkcję, aby upewnić się, że nowe zmiany nie zepsuły istniejących funkcjonalności.
8. Kryteria Akceptacji Testów
   Kryteria Wejścia (Rozpoczęcia Testów):
   Kod źródłowy został pomyślnie skompilowany i zbudowany.
   Środowisko testowe jest dostępne i skonfigurowane.
   Wszystkie testy jednostkowe napisane przez deweloperów przechodzą pomyślnie.
   Kryteria Wyjścia (Zakończenia Testów):
   Wszystkie zdefiniowane scenariusze testowe (automatyczne i manualne) zostały wykonane.
   Osiągnięto docelowe pokrycie kodu testami (np. 85% dla kluczowej logiki biznesowej w backendzie).
   Brak nierozwiązanych błędów o priorytecie krytycznym i wysokim.
   Wszystkie błędy o niższym priorytecie są udokumentowane i zaplanowane do naprawy w przyszłych iteracjach.
   Raport z testów został przygotowany i zaakceptowany przez interesariuszy.
9. Role i Odpowiedzialności
   Deweloperzy:
   Tworzenie i utrzymywanie testów jednostkowych i integracyjnych dla swojego kodu.
   Naprawianie błędów zgłoszonych przez zespół QA.
   Uczestnictwo w code review, z uwzględnieniem jakości testów.
   Inżynier QA:
   Stworzenie i utrzymanie tego planu testów.
   Projektowanie, implementacja i utrzymanie automatycznych testów E2E.
   Wykonywanie testów manualnych i eksploracyjnych.
   Zarządzanie procesem zgłaszania i weryfikacji błędów.
   Raportowanie o stanie jakości oprogramowania.
   Product Owner / Project Manager:
   Definiowanie wymagań funkcjonalnych i kryteriów akceptacji.
   Priorytetyzacja naprawy błędów.
   Ostateczna akceptacja produktu przed wdrożeniem.
10. Procedury Raportowania Błędów
    Każdy znaleziony błąd musi zostać zaraportowany w systemie śledzenia błędów (np. GitHub Issues).
    Zgłoszenie błędu musi zawierać:
    Tytuł: Zwięzły i jednoznaczny opis problemu.
    Opis:
    Kroki do odtworzenia: Szczegółowa, ponumerowana lista kroków prowadzących do wystąpienia błędu.
    Wynik oczekiwany: Co powinno się stać po wykonaniu kroków.
    Wynik aktualny: Co faktycznie się stało.
    Środowisko: Wersja aplikacji, przeglądarka, system operacyjny.
    Priorytet/Waga: Określenie wpływu błędu na działanie aplikacji (np. Krytyczny, Wysoki, Średni, Niski).
    Załączniki: Zrzuty ekranu, nagrania wideo, logi z konsoli przeglądarki lub serwera.
    Cykl życia błędu:
    Nowy (New): Błąd został zgłoszony.
    W Analizie (In Analysis): Błąd jest analizowany przez dewelopera.
    W Trakcie (In Progress): Błąd jest naprawiany.
    Do Weryfikacji (Ready for QA): Błąd został naprawiony i jest gotowy do sprawdzenia przez QA.
    Zamknięty (Closed): QA potwierdziło, że błąd został poprawnie naprawiony.
    Otwarty Ponownie (Reopened): Jeśli weryfikacja nie powiodła się, błąd wraca do dewelopera.
