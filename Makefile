# Google Calendar Component - Makefile

# Phony targets
.PHONY: all install dev build preview test test-ui lint format clean update open setup help

# Variables
NODE_VERSION := 20
NPM := npm
PORT := 5173

# Default target
all: install build

# Install dependencies
install:
	$(NPM) install

# Development server
dev: install
	$(NPM) run dev

# Build for production
build: install
	$(NPM) run build

# Preview production build
preview: build
	$(NPM) run preview

# Run tests
test: install
	$(NPM) run test

# Run Playwright tests
test-ui: install
	$(NPM) run test:ui

# Lint code
lint: install
	$(NPM) run lint

# Format code
format: install
	$(NPM) run format

# Clean build artifacts
clean:
	rm -rf dist/
	rm -rf node_modules/
	rm -rf .nuxt/
	rm -rf coverage/

# Check for updates
update:
	$(NPM) update

# Open development server in browser
open: dev &
	sleep 3
	"$$BROWSER" "http://localhost:$(PORT)"

# Setup development environment
setup: install
	@echo "Development environment setup complete!"
	@echo "Run 'make dev' to start the development server"

# Help
help:
	@echo "Available targets:"
	@echo "  install    - Install dependencies"
	@echo "  dev        - Start development server"
	@echo "  build      - Build for production"
	@echo "  preview    - Preview production build"
	@echo "  test       - Run tests"
	@echo "  test-ui    - Run Playwright UI tests"
	@echo "  lint       - Lint code"
	@echo "  format     - Format code"
	@echo "  clean      - Clean build artifacts"
	@echo "  update     - Update dependencies"
	@echo "  open       - Open dev server in browser"
	@echo "  setup      - Setup development environment"
	@echo "  help       - Show this help message"
