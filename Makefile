.PHONY: help install install-ella install-admin \
	dev dev-backend dev-admin dev-mobile dev-ella \
	wait-backend \
	backend-up backend-down backend-build backend-rebuild backend-restart backend-logs \
	backend-migrate backend-seed backend-reset backend-shell \
	backend-test backend-test-coverage \
	test test-integration test-all \
	lint lint-ella lint-admin \
	build-admin \
	clean clean-backend-tests

BACKEND_DIR     := backend
ELLA_DIR        := ella
ADMIN_DIR       := admin
BACKEND_TESTS   := backend-tests
PORT            ?= 3000
COMPOSE         ?= docker compose

.DEFAULT_GOAL := help

##@ Загальне

help: ## Показати доступні команди
	@echo "Stempo — кореневі команди"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; section = ""} \
		/^##@/ { section = substr($$0, 5); printf "\n\033[1m%s\033[0m\n", section; next } \
		/^[a-zA-Z0-9_-]+:.*##/ { printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "Приклади:"
	@echo "  make dev-admin              # backend (Docker) + admin panel"
	@echo "  make dev-mobile             # backend (Docker) + Expo на телефоні"
	@echo "  LAN_IP=192.168.1.5 make dev-mobile"
	@echo "  SKIP_DOCKER=1 make dev-mobile   # backend уже запущений"

install: install-ella install-admin ## Встановити залежності frontend (ella + admin)

install-ella: ## npm install для мобільного застосунку (ella)
	cd $(ELLA_DIR) && npm install

install-admin: ## npm install для admin panel
	cd $(ADMIN_DIR) && npm install

##@ Розробка

dev: ## Підказка: dev-backend | dev-admin | dev-mobile
	@echo "Оберіть режим розробки:"
	@echo "  make dev-backend   — тільки API (Docker)"
	@echo "  make dev-admin     — API + admin panel (Vite)"
	@echo "  make dev-mobile    — API + Expo (LAN, для телефону)"
	@echo "  make dev-ella      — тільки Expo (backend має бути запущений)"

dev-backend: backend-up ## Запустити backend API (Docker)

dev-admin: backend-up wait-backend ## Запустити backend + admin panel
	cd $(ADMIN_DIR) && npm run dev

dev-mobile: ## Запустити backend (Docker) + Expo з LAN API URL
	@./scripts/dev-mobile.sh

dev-ella: ## Запустити Expo (backend має бути вже запущений)
	cd $(ELLA_DIR) && npm start

wait-backend: ## Дочекатися готовності backend API
	@echo "Очікую backend на http://127.0.0.1:$(PORT)/api/categories ..."
	@for i in $$(seq 1 60); do \
		if curl -sf "http://127.0.0.1:$(PORT)/api/categories" >/dev/null 2>&1; then \
			echo "Backend готовий."; \
			exit 0; \
		fi; \
		sleep 1; \
	done; \
	echo "Backend не відповів за 60 с. Перевір: cd $(BACKEND_DIR) && $(COMPOSE) logs backend" >&2; \
	exit 1

##@ Backend (Docker / Go)

backend-up: ## Зібрати та підняти backend + PostgreSQL
	@$(MAKE) -C $(BACKEND_DIR) docker-up-build

backend-down: ## Зупинити backend контейнери
	@$(MAKE) -C $(BACKEND_DIR) docker-down

backend-build: ## Зібрати Docker-образ backend
	@$(MAKE) -C $(BACKEND_DIR) docker-build

backend-rebuild: ## Перезібрати backend без кешу (після змін у seeder/API)
	@$(MAKE) -C $(BACKEND_DIR) docker-rebuild-backend

backend-restart: ## Перезапустити backend контейнер
	@$(MAKE) -C $(BACKEND_DIR) docker-restart

backend-logs: ## Логи backend контейнера (follow)
	@$(MAKE) -C $(BACKEND_DIR) docker-logs

backend-migrate: ## Міграції в Docker-контейнері
	@$(MAKE) -C $(BACKEND_DIR) docker-migrate

backend-seed: ## Seed даних в Docker-контейнері
	@$(MAKE) -C $(BACKEND_DIR) docker-seed

backend-reset: ## Повний reset: down, up, migrate, seed
	@$(MAKE) -C $(BACKEND_DIR) docker-reset

backend-shell: ## Shell у backend контейнері
	@$(MAKE) -C $(BACKEND_DIR) docker-shell

backend-test: ## Unit-тести Go (backend)
	@$(MAKE) -C $(BACKEND_DIR) test

backend-test-coverage: ## Unit-тести Go з coverage
	@$(MAKE) -C $(BACKEND_DIR) test-coverage

##@ Тести

test: backend-test ## Alias: unit-тести backend

test-integration: ## Інтеграційні API-тести (backend-tests)
	@$(MAKE) -C $(BACKEND_TESTS) test

test-all: backend-test test-integration ## Unit + інтеграційні тести

##@ Якість коду

lint: lint-ella lint-admin ## Lint для ella та admin

lint-ella: ## ESLint для мобільного застосунку
	cd $(ELLA_DIR) && npm run lint

lint-admin: ## ESLint для admin panel
	cd $(ADMIN_DIR) && npm run lint

##@ Збірка

build-admin: ## Production build admin panel
	cd $(ADMIN_DIR) && npm run build

##@ Очищення

clean: clean-backend-tests ## Зупинити тестову інфраструктуру backend-tests

clean-backend-tests: ## Зупинити та видалити тестову БД (backend-tests)
	@$(MAKE) -C $(BACKEND_TESTS) clean
