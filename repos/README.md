# 🧩 Ecossistema de Repositórios e Submódulos (`repos/`)

Este diretório transforma o **`guia-arquitetura-ia`** em um **projeto guarda-chuva (Umbrella Repository)** para centralizar implementações práticas, templates de infraestrutura, POCs de orquestradores, gateways e ferramentas de IA publicadas em repositórios próprios no GitHub.

---

## 🏗️ Como funciona a Arquitetura Guarda-Chuva

Existem **duas formas complementares** de conectar um repositório externo do GitHub a este projeto guarda-chuva:

### 1. Via `Git Submodule` em `repos/<nome-do-repo>` (Código + Docs integrados)
Quando você acopla um repositório via `git submodule`, o código passa a ser referenciado em uma versão exata do commit, e **toda a documentação `.md` do submódulo é indexada automaticamente pelo Visualizador Web (estilo VS Code)** na árvore lateral em `repos/<nome-do-repo>/`.

```bash
# Adicionar um repositório publicado no GitHub como submódulo em repos/
make submodule-add URL=https://github.com/matheusmaiadev/<nome-do-repo>.git NAME=<nome-do-repo>

# Ou diretamente com git:
git submodule add https://github.com/matheusmaiadev/<nome-do-repo>.git repos/<nome-do-repo>
```

### 2. Via Catálogo Declarativo em [`repos/catalog.yaml`](catalog.yaml) (Links de Módulos no GitHub)
Mesmo antes de acoplar o submódulo (ou para repositórios independentes que você queira apenas listar e linkar como módulos do ecossistema), basta registrá-los em [`repos/catalog.yaml`](catalog.yaml). Eles aparecerão automaticamente:
- Na aba **Trilha & Ecossistema (`repos/`)** da barra lateral do Visualizador Web;
- Na seção de **Repositórios e Módulos Vinculados** desta página, com botão direto para o GitHub e para a documentação local.

---

## 🔄 Comandos do Dia a Dia para Submódulos

```bash
# Clonar este repositório guarda-chuva já trazendo todos os submódulos de repos/
git clone --recurse-submodules https://github.com/matheusmaiadev/guia-arquitetura-ia.git

# Inicializar e atualizar todos os submódulos para a versão mais recente da branch remota
make submodules

# Gerar o Visualizador Web (indexa docs/ + todos os submódulos e links de repos/)
make site
```

---

## 📦 Módulos e Repositórios Previstos no Ecossistema

| Módulo / Repositório | Categoria | Relação com a Trilha | Status |
|---|---|---|---|
| **`orquestrador-lambda-bedrock`** | Orquestração & Agentes | Implementação de referência do [Módulo 02](../docs/02-orquestracao/README.md) (ReAct, Tools, DynamoDB, Streaming) | Planejado |
| **`rag-pgvector-hybrid`** | RAG & Dados Vetoriais | Pipeline de ingestão, chunking, busca híbrida e reranking do [Módulo 03](../docs/03-rag-dados/README.md) | Planejado |
| **`serverless-gpu-workers`** | Infraestrutura & Inferência | Templates vLLM / Ollama e endpoints Serverless GPU do [Módulo 04](../docs/04-infraestrutura/README.md) | Planejado |
| **`ai-gateway-finops`** | Governança & FinOps | Controle de tokens, quotas multi-tenant, guardrails e observabilidade do [Módulo 05](../docs/05-governanca-seguranca/README.md) | Planejado |

⬅️ [Voltar ao Índice Principal](../README.md)
