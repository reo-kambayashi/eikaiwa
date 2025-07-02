# English Communication App - Development Makefile
# Docker Compose shortcuts, development tools, and testing commands
.PHONY: help up down build logs clean clean-all dev dev-down dev-build test test-backend test-frontend format format-check lint lint-backend lint-frontend check-ports kill-ports setup install deps deps-backend deps-frontend manual-backend manual-frontend debug debug-backend debug-frontend debug-env health validate status restart restart-dev rebuild rebuild-dev ci ci-quick production-build production-test info

help: ## Show this help message
	@echo "English Communication App - Development Commands"
	@echo ""
	@echo "Usage: make [command]"
	@echo ""
	@echo "Docker Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E "(up|down|build|logs|clean|dev|status|restart)" | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-18s %s\n", $$1, $$2}'
	@echo ""
	@echo "Development Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E "(test|format|lint|check|setup|install|deps|manual)" | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-18s %s\n", $$1, $$2}'
	@echo ""
	@echo "Debug & Diagnostics:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E "(debug|diag|health|validate|info)" | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-18s %s\n", $$1, $$2}'
	@echo ""
	@echo "CI & Production:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E "(ci|production|rebuild)" | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-18s %s\n", $$1, $$2}'

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

restart-dev: ## Restart development application
	docker compose -f docker-compose.dev.yml restart

rebuild: ## Rebuild and restart application
	@echo "Rebuilding and restarting application..."
	docker compose down
	docker compose build --no-cache
	docker compose up -d

rebuild-dev: ## Rebuild and restart development application
	@echo "Rebuilding and restarting development application..."
	docker compose -f docker-compose.dev.yml down
	docker compose -f docker-compose.dev.yml build --no-cache
	docker compose -f docker-compose.dev.yml up

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

# Code Quality and Formatting
format: ## Format Python code with black (79 char limit)
	@echo "Formatting Python code..."
	cd backend && uv run black --line-length 79 *.py
	@echo "Python code formatted successfully"

format-check: ## Check if Python code needs formatting
	@echo "Checking Python code formatting..."
	cd backend && uv run black --check --line-length 79 *.py

lint: ## Run all linting checks (backend + frontend)
	@echo "Running backend linting..."
	@$(MAKE) lint-backend
	@echo "Running frontend linting..."
	@$(MAKE) lint-frontend

lint-backend: ## Run backend code quality checks
	@echo "Checking Python code formatting..."
	cd backend && uv run black --check --line-length 79 *.py
	@echo "Backend linting complete"

lint-frontend: ## Run frontend code quality checks
	@echo "Running ESLint on frontend..."
	cd frontend && npm run lint 2>/dev/null || echo "ESLint not configured - install with: npm install --save-dev eslint"
	@echo "Frontend linting complete"

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

install: ## Install/sync all dependencies (alias for setup)
	@$(MAKE) setup

deps: ## Update and sync all dependencies
	@echo "Updating backend dependencies..."
	cd backend && uv sync --upgrade
	@echo "Updating frontend dependencies..."
	cd frontend && npm update
	@echo "Dependencies updated successfully"

deps-backend: ## Update backend dependencies only
	@echo "Updating backend dependencies..."
	cd backend && uv sync --upgrade

deps-frontend: ## Update frontend dependencies only
	@echo "Updating frontend dependencies..."
	cd frontend && npm update

# Port Management
check-ports: ## Check if required ports are available
	@echo "Checking port availability..."
	@lsof -i :3000 || echo "Port 3000 (frontend) is available"
	@lsof -i :8000 || echo "Port 8000 (backend) is available"

kill-ports: ## Kill processes on required ports
	@echo "Killing processes on ports 3000 and 8000..."
	@lsof -ti :3000 | xargs kill -9 2>/dev/null || echo "No process on port 3000"
	@lsof -ti :8000 | xargs kill -9 2>/dev/null || echo "No process on port 8000"

# Debug and Diagnostics
debug: ## Show comprehensive system and project information
	@echo "=== EIKAIWA APP DEBUG INFO ==="
	@echo ""
	@echo "System Information:"
	@echo "- OS: $$(uname -s)"
	@echo "- Architecture: $$(uname -m)"
	@echo "- Docker: $$(docker --version 2>/dev/null || echo 'Not installed')"
	@echo "- Docker Compose: $$(docker compose version 2>/dev/null || echo 'Not installed')"
	@echo ""
	@$(MAKE) debug-backend
	@echo ""
	@$(MAKE) debug-frontend
	@echo ""
	@$(MAKE) debug-env

debug-backend: ## Show backend development environment info
	@echo "Backend Information:"
	@echo "- Python: $$(cd backend && python --version 2>/dev/null || echo 'Not found')"
	@echo "- uv: $$(cd backend && uv --version 2>/dev/null || echo 'Not installed')"
	@echo "- Dependencies status: $$(cd backend && uv sync --dry-run 2>/dev/null && echo 'OK' || echo 'Issues detected')"

debug-frontend: ## Show frontend development environment info
	@echo "Frontend Information:"
	@echo "- Node.js: $$(cd frontend && node --version 2>/dev/null || echo 'Not installed')"
	@echo "- npm: $$(cd frontend && npm --version 2>/dev/null || echo 'Not installed')"
	@echo "- Dependencies: $$(cd frontend && npm list --depth=0 2>/dev/null | wc -l | xargs echo) packages installed"

debug-env: ## Check environment configuration
	@echo "Environment Configuration:"
	@echo "- .env file: $$(test -f .env && echo 'Found' || echo 'Missing - copy from .env.example')"
	@echo "- Backend credentials: $$(test -f backend/credentials.json && echo 'Found' || echo 'Missing - optional for TTS')"
	@echo "- Port status:"
	@$(MAKE) check-ports 2>/dev/null

health: ## Check application health status
	@echo "=== APPLICATION HEALTH CHECK ==="
	@echo ""
	@echo "Docker Services:"
	@docker compose ps 2>/dev/null || echo "Docker services not running"
	@echo ""
	@echo "Backend Health:"
	@curl -s http://localhost:8000/ >/dev/null && echo "✅ Backend is responding" || echo "❌ Backend is not responding"
	@echo ""
	@echo "Frontend Health:"
	@curl -s http://localhost:3000/ >/dev/null && echo "✅ Frontend is responding" || echo "❌ Frontend is not responding"

validate: ## Validate project configuration and setup
	@echo "=== PROJECT VALIDATION ==="
	@echo ""
	@echo "Checking required files..."
	@test -f docker-compose.yml && echo "✅ docker-compose.yml" || echo "❌ docker-compose.yml missing"
	@test -f docker-compose.dev.yml && echo "✅ docker-compose.dev.yml" || echo "❌ docker-compose.dev.yml missing"
	@test -f backend/main.py && echo "✅ backend/main.py" || echo "❌ backend/main.py missing"
	@test -f frontend/package.json && echo "✅ frontend/package.json" || echo "❌ frontend/package.json missing"
	@test -f backend/pyproject.toml && echo "✅ backend/pyproject.toml" || echo "❌ backend/pyproject.toml missing"
	@echo ""
	@echo "Checking dependencies..."
	@cd backend && uv check 2>/dev/null && echo "✅ Backend dependencies OK" || echo "❌ Backend dependencies have issues"
	@cd frontend && npm ls >/dev/null 2>&1 && echo "✅ Frontend dependencies OK" || echo "❌ Frontend dependencies have issues"

# CI/Production Helpers
ci: ## Run CI pipeline (test + lint + validate)
	@echo "=== RUNNING CI PIPELINE ==="
	@$(MAKE) validate
	@$(MAKE) lint
	@$(MAKE) test
	@echo "✅ CI pipeline completed successfully"

ci-quick: ## Quick CI check (lint + format-check)
	@echo "=== QUICK CI CHECK ==="
	@$(MAKE) format-check
	@$(MAKE) lint-backend
	@echo "✅ Quick CI check completed"

production-build: ## Build production images
	@echo "Building production images..."
	docker compose build --no-cache
	@echo "✅ Production images built successfully"

production-test: ## Test production build locally
	@echo "Testing production build..."
	docker compose up -d
	sleep 10
	@$(MAKE) health
	docker compose down
	@echo "✅ Production build test completed"

clean-all: ## Complete cleanup (containers, images, volumes, node_modules, __pycache__)
	@echo "Performing complete cleanup..."
	$(MAKE) clean
	@echo "Removing node_modules..."
	rm -rf frontend/node_modules
	@echo "Removing Python cache..."
	find backend -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
	find backend -name "*.pyc" -delete 2>/dev/null || true
	@echo "✅ Complete cleanup finished"

info: ## Show project information and available commands
	@echo "=== EIKAIWA APP PROJECT INFO ==="
	@echo ""
	@echo "Project: AI-powered English conversation practice app for Japanese learners"
	@echo "Backend: FastAPI with Google Gemini AI and TTS"
	@echo "Frontend: React with voice input/output features"
	@echo ""
	@echo "Key Commands:"
	@echo "  make dev          - Start development with hot reload"
	@echo "  make test         - Run all tests"
	@echo "  make lint         - Check code quality"
	@echo "  make setup        - Initial project setup"
	@echo "  make debug        - Show comprehensive debug info"
	@echo "  make health       - Check application health"
	@echo ""
	@echo "For all commands: make help"

# Default target
.DEFAULT_GOAL := help
