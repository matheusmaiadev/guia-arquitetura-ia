THEME ?= default
PYTHON_VERSION ?= 3.12
PORT ?= 8080

.PHONY: help setup build pdf site site-full preview submodule-add submodules clean

help:
	@echo "Comandos disponíveis (Guia de Arquitetura de IA — Umbrella Project):"
	@echo "  make setup                                                  Instala dependências do motor gerador (via uv)"
	@echo "  make build [THEME=default]                                  Gera todos os PDFs (capítulos + cadernos de módulo em dist/)"
	@echo "  make pdf FILE=docs/01-fundamentos/02-llm-deep-dive.md       Gera o PDF de apenas um capítulo"
	@echo "  make site                                                   Empacota o site leitor (estilo VS Code) em dist/site/"
	@echo "  make site-full                                              Gera todos os PDFs + empacota o site completo em dist/site/"
	@echo "  make preview [PORT=8080]                                    Gera o site e abre servidor local em localhost:PORT"
	@echo "  make submodule-add URL=<git-url> NAME=<nome>                Adiciona um repositório filho em repos/<nome> (Git Submodule)"
	@echo "  make submodules                                             Inicializa e atualiza todos os submódulos em repos/"
	@echo "  make clean                                                  Remove a pasta dist/"

setup:
	cd engine && uv sync --python $(PYTHON_VERSION)

build:
	cd engine && uv run --python $(PYTHON_VERSION) python build.py --theme $(THEME)

pdf:
	@if [ -z "$(FILE)" ]; then \
		echo "Erro: informe o arquivo. Ex: make pdf FILE=docs/01-fundamentos/05-treinamento-e-fine-tuning.md"; \
		exit 1; \
	fi
	cd engine && uv run --python $(PYTHON_VERSION) python build.py --file "../$(FILE)" --theme $(THEME)

site:
	cd engine && uv run --python $(PYTHON_VERSION) python site.py --theme $(THEME)

site-full:
	cd engine && uv run --python $(PYTHON_VERSION) python site.py --build-pdfs --theme $(THEME)

preview: site
	@echo "Servidor local disponível em http://localhost:$(PORT)"
	python3 -m http.server $(PORT) --directory dist/site

submodule-add:
	@if [ -z "$(URL)" ] || [ -z "$(NAME)" ]; then \
		echo "Erro: informe URL e NAME. Ex: make submodule-add URL=https://github.com/matheusmaiadev/meu-repo.git NAME=meu-repo"; \
		exit 1; \
	fi
	git submodule add "$(URL)" "repos/$(NAME)"
	@echo "[ok] Submódulo acoplado em repos/$(NAME). Registre-o também em repos/catalog.yaml se desejar enriquecer os metadados."

submodules:
	git submodule update --init --recursive --remote --merge

clean:
	rm -rf dist/
	@echo "Pasta dist/ removida."
