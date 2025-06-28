# English Communication App - Development Makefile
# Docker Compose shortcuts, development tools, and testing commands
.PHONY: help up down build logs clean dev test format check-ports setup

help: ## Show this help message
	@echo "English Communication App - Development Commands"
	@echo ""
	@echo "Usage: make [command]"
	@echo ""
	@echo "Docker Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E "(up|down|build|logs|clean|dev|status|restart)" | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'
	@echo ""
	@echo "Development Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E "(test|format|check|setup|manual)" | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

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

# Testing Commands
test: ## Run all tests (backend + frontend)
	@echo "Running backend tests..."
	cd backend && uv run pytest tests/ -v
	@echo "Running frontend tests..."
	cd frontend && npm test -- --coverage --watchAll=false

test-backend: ## Run backend tests only
	cd backend && uv run pytest tests/ -v

test-frontend: ## Run frontend tests only
	cd frontend && npm test -- --coverage --watchAll=false

# Code Formatting and Quality
format: ## Format Python code with black (79 char limit)
	cd backend && uv run black --line-length 79 *.py
	@echo "Python code formatted successfully"

format-check: ## Check if Python code needs formatting
	cd backend && uv run black --check --line-length 79 *.py

# Manual Development (without Docker)
manual-backend: ## Start backend development server manually
	@echo "Starting backend server at http://localhost:8000"
	cd backend && uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000

manual-frontend: ## Start frontend development server manually
	@echo "Starting frontend server at http://localhost:3000"
	cd frontend && npm start

# Environment and Setup
setup: ## Initial project setup (install dependencies)
	@echo "Setting up backend dependencies..."
	cd backend && uv sync
	@echo "Setting up frontend dependencies..."
	cd frontend && npm install
	@echo "Setup complete! Copy .env.example to .env and add your API keys"

check-ports: ## Check if required ports are available
	@echo "Checking port availability..."
	@lsof -i :3000 || echo "Port 3000 (frontend) is available"
	@lsof -i :8000 || echo "Port 8000 (backend) is available"

kill-ports: ## Kill processes on required ports
	@echo "Killing processes on ports 3000 and 8000..."
	@lsof -ti :3000 | xargs kill -9 2>/dev/null || echo "No process on port 3000"
	@lsof -ti :8000 | xargs kill -9 2>/dev/null || echo "No process on port 8000"

# Default target
.DEFAULT_GOAL := help
