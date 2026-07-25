.PHONY: test setup clean up

test: setup
	go test -v ./...

test-coverage: setup
	go test -v -cover ./...

setup:
	docker-compose up -d
	@echo "Waiting for database to be ready..."
	@sleep 5

clean:
	docker-compose down -v

up:
	docker-compose up -d

down:
	docker-compose down
