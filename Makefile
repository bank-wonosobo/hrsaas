
ENV ?= dev
-include .env.$(ENV)

DB_URL = "postgresql://$(DB_USER):$(DB_PASS)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=$(DB_SSLMODE)"

MIGRATE = migrate -path database/migrations -database $(DB_URL)


## Jalankan semua migrasi
migrate-up:
	$(MIGRATE) up

## Rollback semua migrasi
migrate-down:
	$(MIGRATE) down

## Jalankan N migrasi ke atas   → make migrate-up-n N=1
migrate-up-n:
	$(MIGRATE) up $(N)

## Rollback N migrasi ke bawah  → make migrate-down-n N=1
migrate-down-n:
	$(MIGRATE) down $(N)

## Paksa set versi migrasi (untuk fix dirty state) → make migrate-force V=20260514023530
migrate-force:
	$(MIGRATE) force $(V)

migrate-drop:
	$(MIGRATE) drop

## Lihat versi migrasi saat ini
migrate-version:
	$(MIGRATE) version

## Buat file migrasi baru → make migrate-create NAME=create_table_xxx
migrate-create:
	migrate create -ext sql -dir database/migrations -format "20060102150405" $(NAME)

## Jalankan client-api (Go)
run-client:
	cd apps/client-api && go run main.go

## Jalankan admin-api (Go)
run-admin:
	cd apps/admin-api && go run cmd/web/main.go

## Jalankan database seeder dari root repository
seed:
	cd apps/admin-api && go run cmd/seed/main.go

## Jalankan client-mobile (Expo)
run-expo:
	cd apps/client-mobile && npx expo start

## Jalankan admin-panel (Next.js)
run-admin-panel:
	cd apps/admin-panel && npm run dev
