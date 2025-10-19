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

### Tabela: `shopping_lists`
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

| Nazwa kolumny      | Typ danych                  | Ograniczenia                               | Opis                               |
|--------------------| --------------------------- | ------------------------------------------ | ---------------------------------- |
| `id`               | `BIGINT`                 | `PRIMARY KEY`                              | Unikalny identyfikator produktu    |
| `shopping_list_id` | `BIGINT`                    | `NOT NULL`, `REFERENCES shopping_lists(id) ON DELETE CASCADE` | ID listy, do której należy produkt |
| `name`             | `VARCHAR(255)`              | `NOT NULL`                                 | Nazwa produktu                     |
| `description`      | `VARCHAR(255)`              |                                            | Opcjonalny opis/ilość produktu     |
| `is_bought`        | `BOOLEAN`                   | `NOT NULL`, `DEFAULT false`                | Status, czy produkt został kupiony |
| `created_at`       | `TIMESTAMP WITH TIME ZONE`  | `NOT NULL`, `DEFAULT NOW()`                | Data dodania produktu              |

### Tabela: `shopping_list_shares`
Tabela łącząca, która zarządza dostępem użytkowników do współdzielonych list.

| Nazwa kolumny      | Typ danych | Ograniczenia                               | Opis                                         |
|--------------------| ---------- | ------------------------------------------ | -------------------------------------------- |
| `shopping_list_id` | `BIGINT`   | `NOT NULL`, `REFERENCES shopping_lists(id) ON DELETE CASCADE` | ID współdzielonej listy                      |
| `user_id`          | `BIGINT`   | `NOT NULL`, `REFERENCES users(id) ON DELETE CASCADE` | ID użytkownika, któremu udostępniono listę |
|                    |            | `PRIMARY KEY (shopping_list_id, user_id)`           | Klucz główny złożony                         |

## 2. Relacje Między Tabelami

-   **`users` 1..* --- 0..* `shopping_lists`**: Jeden użytkownik (`users`) może być właścicielem wielu list (`shopping_lists`). Każda lista ma dokładnie jednego właściciela.
-   **`shopping_lists` 1..* --- 0..* `items`**: Jedna lista (`shopping_lists`) może zawierać wiele produktów (`items`). Każdy produkt należy do dokładnie jednej listy.
-   **`users` 0..* --- 0..* `shopping_lists` (przez `shopping_list_shares`)**: Relacja wiele-do-wielu. Jeden użytkownik (`users`) może mieć dostęp do wielu współdzielonych list (`shopping_lists`), a jedna lista może być udostępniona wielu użytkownikom. Tabela `shopping_list_shares` realizuje tę relację.

## 3. Indeksy

W celu optymalizacji wydajności zapytań, zaleca się utworzenie następujących indeksów:

-   `CREATE INDEX idx_shopping_lists_owner_id ON shopping_lists(owner_id);`
-   `CREATE INDEX idx_items_shopping_list_id ON items(shopping_list_id);`
-   `CREATE INDEX idx_shopping_list_shares_shopping_list_id ON shopping_list_shares(shopping_list_id);`
-   `CREATE INDEX idx_shopping_list_shares_user_id ON shopping_list_shares(user_id);`
-   `CREATE UNIQUE INDEX idx_users_email ON users(email);`
-   `CREATE UNIQUE INDEX idx_shopping_lists_share_token ON shopping_lists(share_token);`

## 4. Zasady PostgreSQL (RLS)

Zgodnie z decyzjami podjętymi podczas sesji planowania, na etapie MVP nie będą implementowane zasady bezpieczeństwa na poziomie wiersza (Row-Level Security). Cała logika autoryzacji i kontroli dostępu do danych będzie zarządzana w warstwie aplikacyjnej (Spring Boot).

## 5. Dodatkowe Uwagi

-   **Aktualizacja `updated_at`**: Zaleca się stworzenie funkcji i triggera w PostgreSQL, które automatycznie zaktualizują pole `shopping_lists.updated_at` za każdym razem, gdy zostanie dodany, usunięty lub zmodyfikowany produkt (`items`) powiązany z daną listą. Zapewni to spójność danych i odciąży logikę aplikacji.
    ```sql
    CREATE OR REPLACE FUNCTION update_shopping_list_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        UPDATE shopping_lists
        SET updated_at = NOW()
        WHERE id = NEW.shopping_list_id OR id = OLD.shopping_list_id;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_update_shopping_list_on_item_change
    AFTER INSERT OR UPDATE OR DELETE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_shopping_list_updated_at()
    ```
