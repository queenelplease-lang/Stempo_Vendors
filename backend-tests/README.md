# Backend API Tests

Окремий проект для тестування всіх роутів бекенду Stempo.

## Структура

- `main_test.go` - головний файл з тестами для всіх роутів
- `setup.go` - налаштування тестового середовища та бази даних
- `fixtures.go` - тестові дані (користувачі, бізнеси, програми)
- `helpers.go` - допоміжні функції для тестів (створення запитів, перевірка відповідей)
- `docker-compose.yml` - окрема тестова база даних PostgreSQL
- `run.sh` - скрипт для запуску тестів

## Запуск

### Варіант 1: Використовуючи скрипт (рекомендовано)

```bash
./run.sh
```

### Варіант 2: Вручну

1. Запустити тестову базу даних:
```bash
docker-compose up -d
```

2. Дочекатися готовності бази (5-10 секунд)

3. Встановити змінні оточення:
```bash
export DB_HOST=localhost
export DB_PORT=5433
export DB_USER=stempo_test
export DB_PASSWORD=stempo_test_password
export DB_NAME=stempo_test_db
export JWT_SECRET=test-secret-key-for-testing-only
```

4. Запустити тести:
```bash
go test -v ./...
```

5. Зупинити тестову базу даних:
```bash
docker-compose down
```

### Варіант 3: Використовуючи Makefile

```bash
make setup  # Запустити базу даних
make test   # Запустити тести
make clean  # Зупинити та видалити базу даних
```

## Тестова база даних

- **Host**: localhost
- **Port**: 5433 (щоб не конфліктувати з основною базою на 5432)
- **User**: stempo_test
- **Password**: stempo_test_password
- **Database**: stempo_test_db

## Тестові дані

Проект автоматично створює тестові дані перед запуском тестів:
- Тестові користувачі (test@example.com / test123)
- Тестові бізнеси
- Тестові бонусні програми
- Тестові міста (Київ, Львів)
- Тестові категорії (Coffee, Sports, Food)

## Тестовані роути

### Auth Routes
- ✅ POST /api/auth/register
- ✅ POST /api/auth/login
- ✅ GET /api/auth/me
- ✅ PUT /api/auth/me
- ✅ POST /api/auth/logout

### Business Routes
- ✅ GET /api/businesses
- ✅ GET /api/businesses/featured
- ✅ GET /api/businesses/newest
- ✅ GET /api/businesses/:id
- ✅ GET /api/businesses/my-business
- ✅ POST /api/businesses
- ✅ PUT /api/businesses/:id
- ✅ DELETE /api/businesses/:id

### Bonus Program Routes
- ✅ GET /api/bonus-programs
- ✅ GET /api/bonus-programs/:id
- ✅ GET /api/bonus-programs/by-business/:id
- ✅ POST /api/bonus-programs
- ✅ PUT /api/bonus-programs/:id
- ✅ DELETE /api/bonus-programs/:id

### Category Routes
- ✅ GET /api/categories
- ✅ GET /api/categories/:slug

### City Routes
- ✅ GET /api/cities
- ✅ GET /api/cities/:id
- ✅ POST /api/cities
- ✅ PUT /api/cities/:id
- ✅ DELETE /api/cities/:id

### Loyalty Card Routes
- ✅ GET /api/loyalty-cards
- ✅ GET /api/loyalty-cards/:id
- ✅ POST /api/loyalty-cards
- ✅ POST /api/loyalty-cards/:id/stamps

### Admin Routes
- ✅ GET /api/admin/businesses/pending
- ✅ GET /api/admin/bonus-programs/pending
- ✅ POST /api/admin/businesses/:id/approve
- ✅ POST /api/admin/bonus-programs/:id/approve

## Залежності

Проект використовує код з основного бекенду через `replace` директиву в `go.mod`:
```go
replace github.com/stempo/backend => ../backend
```

Це дозволяє використовувати всі типи, handlers, usecases та repositories з основного проекту.

## Примітки

- Тестова база даних автоматично очищається перед кожним запуском тестів
- Тестові дані створюються автоматично перед запуском тестів
- JWT токени генеруються з тестовим секретом для автентифікації
- Всі тести використовують testify/suite для структурованого тестування
