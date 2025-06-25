# Docker Compose shortcut commands
.PHONY: help up down build logs clean dev

help: ## Show this help message
	@echo "English Communication App - Docker Commands"
	@echo ""
	@echo "Usage: make [command]"
	@echo ""
	@echo "Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-12s %s\n", $$1, $$2}'

up: ## Start the application (production mode)
	docker compose up -d

down: ## Stop the application
	docker compose down

build: ## Build the Docker images
	docker compose build --no-cache

logs: ## Show application logs
	docker compose logs -f

clean: ## Remove all containers, images, and volumes
	docker compose down -v --rmi all --remove-orphans

dev: ## Start the application in development mode with hot reload
	docker compose -f docker-compose.dev.yml up

dev-down: ## Stop the development application
	docker compose -f docker-compose.dev.yml down

dev-build: ## Build development images
	docker compose -f docker-compose.dev.yml build --no-cache

status: ## Show container status
	docker compose ps

restart: ## Restart the application
	docker compose restart

# Default target
.DEFAULT_GOAL := help
