NPM   ?= npm
IMAGE ?= zenfix-ui
PORT  ?= 5173

.DEFAULT_GOAL := help

.PHONY: help install dev build preview lint lint-fix format format-check docker-build docker-run clean

help:
	@printf "  \033[36m%-18s\033[0m %s\n" "help" "Show this help"
	@printf "  \033[36m%-18s\033[0m %s\n" "install" "Install npm dependencies"
	@printf "  \033[36m%-18s\033[0m %s\n" "dev" "Start Vite dev server"
	@printf "  \033[36m%-18s\033[0m %s\n" "build" "Production build"
	@printf "  \033[36m%-18s\033[0m %s\n" "preview" "Preview production build locally"
	@printf "  \033[36m%-18s\033[0m %s\n" "lint" "Run ESLint"
	@printf "  \033[36m%-18s\033[0m %s\n" "lint-fix" "Fix ESLint issues automatically"
	@printf "  \033[36m%-18s\033[0m %s\n" "format" "Format with Prettier"
	@printf "  \033[36m%-18s\033[0m %s\n" "format-check" "Check formatting without writing"
	@printf "  \033[36m%-18s\033[0m %s\n" "check" "Run lint + format check together"
	@printf "  \033[36m%-18s\033[0m %s\n" "docker-build" "Build Docker image"
	@printf "  \033[36m%-18s\033[0m %s\n" "docker-run" "Serve the production build on port 8080"
	@printf "  \033[36m%-18s\033[0m %s\n" "clean" "Remove build artifacts and node_modules"

install:
	$(NPM) install

dev:
	$(NPM) run dev

build:
	$(NPM) run build

preview:
	$(NPM) run preview

lint:
	$(NPM) run lint

lint-fix:
	$(NPM) run lint:fix

format:
	$(NPM) run format

format-check:
	$(NPM) run format:check

check:
	$(MAKE) lint && $(MAKE) format-check

docker-build:
	docker build -t $(IMAGE) .

docker-run:
	docker run --rm -p 8080:80 $(IMAGE)

clean:
	rm -rf dist node_modules
