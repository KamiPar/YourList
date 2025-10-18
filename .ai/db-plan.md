# Schemat Bazy Danych PostgreSQL - YourList MVP

## 1. Lista Tabel

### Tabela: `users`
Przechowuje informacje o zarejestrowanych użytkownikach.

| Nazwa kolumny   | Typ danych                | Ograniczenia                               | Opis                               |
| --------------- |---------------------------| ------------------------------------------ | ---------------------------------- |
| `id`            | `BIGINT `                 | `PRIMARY KEY`                              | Unikalny identyfikator użytkownika |
| `email`         | `VARCHAR(255)`            | `UNIQUE`, `NOT NULL`                       | Adres e-mail użytkownika (login)   |
| `password_hash` | `VARCHAR(255)`            | `NOT NULL`                                 | Hash hasła użytkownika (bcrypt)    |
| `created_at`    | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT NOW()`                | Data utworzenia konta              |

### Tabela: `lists`
Przechowuje listy zakupów utworzone przez użytkowników.

| Nazwa kolumny   | Typ danych                  | Ograniczenia                               | Opis                                                       |
| --------------- | --------------------------- | ------------------------------------------ | ---------------------------------------------------------- |
| `id`            | `BIGINT`                 | `PRIMARY KEY`                              | Unikalny identyfikator listy                               |
| `owner_id`      | `BIGINT`                    | `NOT NULL`, `REFERENCES users(id) ON DELETE CASCADE` | ID właściciela listy                                       |
| `name`          | `VARCHAR(255)`              | `NOT NULL`                                 | Nazwa listy zakupów                                        |
| `share_token`   | `UUID`                      | `UNIQUE`, `NOT NULL`, `DEFAULT gen_random_uuid()` | Unikalny token do udostępniania listy                      |
| `created_at`    | `TIMESTAMP WITH TIME ZONE`  | `NOT NULL`, `DEFAULT NOW()`                | Data utworzenia listy                                      |
| `updated_at`    | `TIMESTAMP WITH TIME ZONE`  | `NOT NULL`, `DEFAULT NOW()`                | Data ostatniej modyfikacji listy                           |

### Tabela: `items`
Przechowuje poszczególne produkty na listach zakupów.

| Nazwa kolumny   | Typ danych                  | Ograniczenia                               | Opis                               |
| --------------- | --------------------------- | ------------------------------------------ | ---------------------------------- |
| `id`            | `BIGINT`                 | `PRIMARY KEY`                              | Unikalny identyfikator produktu    |
| `list_id`       | `BIGINT`                    | `NOT NULL`, `REFERENCES lists(id) ON DELETE CASCADE` | ID listy, do której należy produkt |
| `name`          | `VARCHAR(255)`              | `NOT NULL`                                 | Nazwa produktu                     |
| `description`   | `VARCHAR(255)`              |                                            | Opcjonalny opis/ilość produktu     |
| `is_bought`     | `BOOLEAN`                   | `NOT NULL`, `DEFAULT false`                | Status, czy produkt został kupiony |
| `created_at`    | `TIMESTAMP WITH TIME ZONE`  | `NOT NULL`, `DEFAULT NOW()`                | Data dodania produktu              |

### Tabela: `list_shares`
Tabela łącząca, która zarządza dostępem użytkowników do współdzielonych list.

| Nazwa kolumny | Typ danych | Ograniczenia                               | Opis                                         |
| ------------- | ---------- | ------------------------------------------ | -------------------------------------------- |
| `list_id`     | `BIGINT`   | `NOT NULL`, `REFERENCES lists(id) ON DELETE CASCADE` | ID współdzielonej listy                      |
| `user_id`     | `BIGINT`   | `NOT NULL`, `REFERENCES users(id) ON DELETE CASCADE` | ID użytkownika, któremu udostępniono listę |
|               |            | `PRIMARY KEY (list_id, user_id)`           | Klucz główny złożony                         |

## 2. Relacje Między Tabelami

-   **`users` 1..* --- 0..* `lists`**: Jeden użytkownik (`users`) może być właścicielem wielu list (`lists`). Każda lista ma dokładnie jednego właściciela.
-   **`lists` 1..* --- 0..* `items`**: Jedna lista (`lists`) może zawierać wiele produktów (`items`). Każdy produkt należy do dokładnie jednej listy.
-   **`users` 0..* --- 0..* `lists` (przez `list_shares`)**: Relacja wiele-do-wielu. Jeden użytkownik (`users`) może mieć dostęp do wielu współdzielonych list (`lists`), a jedna lista może być udostępniona wielu użytkownikom. Tabela `list_shares` realizuje tę relację.

## 3. Indeksy

W celu optymalizacji wydajności zapytań, zaleca się utworzenie następujących indeksów:

-   `CREATE INDEX idx_lists_owner_id ON lists(owner_id);`
-   `CREATE INDEX idx_items_list_id ON items(list_id);`
-   `CREATE INDEX idx_list_shares_list_id ON list_shares(list_id);`
-   `CREATE INDEX idx_list_shares_user_id ON list_shares(user_id);`
-   `CREATE UNIQUE INDEX idx_users_email ON users(email);`
-   `CREATE UNIQUE INDEX idx_lists_share_token ON lists(share_token);`

## 4. Zasady PostgreSQL (RLS)

Zgodnie z decyzjami podjętymi podczas sesji planowania, na etapie MVP nie będą implementowane zasady bezpieczeństwa na poziomie wiersza (Row-Level Security). Cała logika autoryzacji i kontroli dostępu do danych będzie zarządzana w warstwie aplikacyjnej (Spring Boot).

## 5. Dodatkowe Uwagi

-   **Aktualizacja `updated_at`**: Zaleca się stworzenie funkcji i triggera w PostgreSQL, które automatycznie zaktualizują pole `lists.updated_at` za każdym razem, gdy zostanie dodany, usunięty lub zmodyfikowany produkt (`items`) powiązany z daną listą. Zapewni to spójność danych i odciąży logikę aplikacji.
    ```sql
    CREATE OR REPLACE FUNCTION update_list_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        UPDATE lists
        SET updated_at = NOW()
        WHERE id = NEW.list_id OR id = OLD.list_id;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_update_list_on_item_change
    AFTER INSERT OR UPDATE OR DELETE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_list_updated_at();
    ```
